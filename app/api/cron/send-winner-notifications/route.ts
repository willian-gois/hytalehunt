import { type NextRequest, NextResponse } from "next/server"

import { endOfDay, startOfDay, subDays } from "date-fns"
import { and, eq, gte, inArray, lt } from "drizzle-orm"

import { sendWinnerBadgeEmail } from "@/lib/transactional-emails"

import { db } from "@/drizzle/db"
import { launchStatus, server, user } from "@/drizzle/db/schema"
import { env } from "@/env"

const API_KEY = env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const providedKey = authHeader?.replace("Bearer ", "")

    if (!API_KEY || providedKey !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const yesterday = subDays(startOfDay(now), 1)
    const endOfYesterday = endOfDay(yesterday)

    console.log(`[${now.toISOString()}] Starting cron: Send Winner Notifications`)
    console.log(
      `Looking for winners from: ${yesterday.toISOString()} to ${endOfYesterday.toISOString()}`,
    )

    const winners = await db
      .select({
        serverId: server.id,
        serverName: server.name,
        serverSlug: server.slug,
        serverRanking: server.dailyRanking,
        serverCreatorId: server.createdBy,
        serverLaunchType: server.launchType,
      })
      .from(server)
      .where(
        and(
          eq(server.launchStatus, launchStatus.LAUNCHED),
          inArray(server.dailyRanking, [1, 2, 3]),
          gte(server.scheduledLaunchDate, yesterday),
          lt(server.scheduledLaunchDate, startOfDay(now)),
        ),
      )
      .execute()

    if (winners.length === 0) {
      console.log("No new winners found to notify.")
      return NextResponse.json({ message: "No new winners to notify." })
    }

    console.log(`Found ${winners.length} winning servers to notify.`)
    let emailsSentCount = 0
    let emailsFailedCount = 0

    for (const winner of winners) {
      if (!winner.serverCreatorId || !winner.serverRanking) {
        console.warn(`Skipping server ${winner.serverName} due to missing creator ID or ranking.`)
        continue
      }

      const serverCreator = await db
        .select({
          email: user.email,
          name: user.name,
        })
        .from(user)
        .where(eq(user.id, winner.serverCreatorId))
        .limit(1)
        .then((res) => res[0])

      if (!serverCreator || !serverCreator.email) {
        console.warn(
          `User not found or email missing for creator ID ${winner.serverCreatorId} of server ${winner.serverName}.`,
        )
        emailsFailedCount++
        continue
      }

      try {
        console.log(
          `Sending winner email to ${serverCreator.email} for server ${winner.serverName}`,
        )

        await sendWinnerBadgeEmail({
          user: { email: serverCreator.email, name: serverCreator.name },
          serverName: winner.serverName,
          serverSlug: winner.serverSlug,
          ranking: winner.serverRanking,
          launchType: winner.serverLaunchType,
        })
        emailsSentCount++
      } catch (error) {
        emailsFailedCount++
        console.error(
          `Failed to send winner email for server ${winner.serverName} to ${serverCreator.email}:`,
          error,
        )
      }
    }

    console.log(`[${now.toISOString()}] Winner notification process completed.`)
    console.log(`- Emails sent successfully: ${emailsSentCount}`)
    console.log(`- Emails failed: ${emailsFailedCount}`)

    return NextResponse.json({
      message: "Winner notification process completed.",
      details: {
        winnersFound: winners.length,
        emailsSent: emailsSentCount,
        emailsFailed: emailsFailedCount,
      },
    })
  } catch (error) {
    console.error("Error in send-winner-notifications cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
