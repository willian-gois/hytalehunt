import { type NextRequest, NextResponse } from "next/server"

import { endOfDay, startOfDay } from "date-fns"
import { and, eq, gte, lt } from "drizzle-orm"

import { sendLaunchReminderEmail } from "@/lib/transactional-emails"

import { db } from "@/drizzle/db"
import { launchStatus, server, user } from "@/drizzle/db/schema"

const API_KEY = process.env.CRON_API_KEY

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const providedKey = authHeader?.replace("Bearer ", "")

    if (!API_KEY || providedKey !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = startOfDay(now)
    const endOfToday = endOfDay(now)

    console.log(`[${now.toISOString()}] Starting cron: Send Ongoing Launch Reminders`)
    console.log(
      `Looking for servers ongoing from: ${today.toISOString()} to ${endOfToday.toISOString()}`,
    )

    const ongoingServers = await db
      .select({
        serverId: server.id,
        serverName: server.name,
        serverSlug: server.slug,
        serverCreatorId: server.createdBy,
      })
      .from(server)
      .where(
        and(
          eq(server.launchStatus, launchStatus.ONGOING),
          gte(server.scheduledLaunchDate, today),
          lt(server.scheduledLaunchDate, endOfToday),
        ),
      )
      .execute()

    if (ongoingServers.length === 0) {
      console.log("No ongoing servers found to remind.")
      return NextResponse.json({ message: "No ongoing servers to remind." })
    }

    console.log(`Found ${ongoingServers.length} ongoing servers to remind.`)
    let emailsSentCount = 0
    let emailsFailedCount = 0

    for (const proj of ongoingServers) {
      if (!proj.serverCreatorId) {
        console.warn(`Skipping server ${proj.serverName} due to missing creator ID.`)
        continue
      }

      const serverCreator = await db
        .select({
          email: user.email,
          name: user.name,
        })
        .from(user)
        .where(eq(user.id, proj.serverCreatorId))
        .limit(1)
        .then((res) => res[0])

      if (!serverCreator || !serverCreator.email) {
        console.warn(
          `User not found or email missing for creator ID ${proj.serverCreatorId} of server ${proj.serverName}.`,
        )
        emailsFailedCount++
        continue
      }

      try {
        console.log(
          `Sending launch reminder email to ${serverCreator.email} for server ${proj.serverName}`,
        )

        await sendLaunchReminderEmail({
          user: { email: serverCreator.email, name: serverCreator.name },
          serverName: proj.serverName,
          serverSlug: proj.serverSlug,
        })
        emailsSentCount++
      } catch (error) {
        emailsFailedCount++
        console.error(
          `Failed to send launch reminder email for server ${proj.serverName} to ${serverCreator.email}:`,
          error,
        )
      }
    }

    console.log(`[${now.toISOString()}] Launch reminder process completed.`)
    console.log(`- Emails sent successfully: ${emailsSentCount}`)
    console.log(`- Emails failed: ${emailsFailedCount}`)

    return NextResponse.json({
      message: "Launch reminder process completed.",
      details: {
        serversFound: ongoingServers.length,
        emailsSent: emailsSentCount,
        emailsFailed: emailsFailedCount,
      },
    })
  } catch (error) {
    console.error("Error in send-ongoing-reminders cron:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
