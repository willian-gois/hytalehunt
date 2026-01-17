import { type NextRequest, NextResponse } from "next/server"

import { endOfDay, startOfDay, subDays, subHours } from "date-fns"
import { and, count, desc, eq, gte, inArray, lt, lte } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { launchStatus, server, upvote } from "@/drizzle/db/schema"
import { env } from "@/env"

// Clé API pour sécuriser l'endpoint
const API_KEY = env.CRON_API_KEY

export async function GET(request: NextRequest) {
  try {
    // Vérification de la clé API
    const authHeader = request.headers.get("authorization")
    const providedKey = authHeader?.replace("Bearer ", "")

    if (!API_KEY || providedKey !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Date actuelle en UTC
    const now = new Date()
    const today = startOfDay(now)
    const yesterday = subDays(today, 1)

    // Date limite pour les paiements abandonnés (24 heures)
    const paymentDeadline = subHours(now, 24)

    // Déclarer rankGroups ici pour qu'il soit accessible plus tard
    let rankGroups: Array<Array<{ serverId: string; serverName: string; upvoteCount: number }>> = []

    // 1. Update SCHEDULED -> ONGOING
    const scheduledToOngoing = await db
      .update(server)
      .set({
        launchStatus: launchStatus.ONGOING,
        updatedAt: now,
      })
      .where(
        and(
          eq(server.launchStatus, launchStatus.SCHEDULED),
          gte(server.scheduledLaunchDate, today),
          lt(server.scheduledLaunchDate, endOfDay(today)),
        ),
      )
      .returning({ id: server.id, name: server.name })

    // 2. Update ONGOING -> LAUNCHED
    const ongoingToLaunched = await db
      .update(server)
      .set({
        launchStatus: launchStatus.LAUNCHED,
        updatedAt: now,
      })
      .where(
        and(
          eq(server.launchStatus, launchStatus.ONGOING),
          gte(server.scheduledLaunchDate, yesterday),
          lt(server.scheduledLaunchDate, today),
        ),
      )
      .returning({ id: server.id, name: server.name })

    // 3. Calculer les 3 projets les plus populaires
    const justLaunchedServerIds = ongoingToLaunched.map((p) => p.id)
    console.log(`Projets passés à LAUNCHED: ${justLaunchedServerIds.length}`, justLaunchedServerIds)

    if (justLaunchedServerIds.length > 0) {
      // Utiliser inArray pour la requête d'upvotes
      const serverUpvotes = await db
        .select({
          serverId: upvote.serverId,
          count: count(upvote.id),
        })
        .from(upvote)
        .where(inArray(upvote.serverId, justLaunchedServerIds))
        .groupBy(upvote.serverId)
        .orderBy(desc(count(upvote.id)))
        .execute()

      const serversWithUpvotes = ongoingToLaunched
        .map((proj) => {
          const upvoteData = serverUpvotes.find((uv) => uv.serverId === proj.id)
          return {
            serverId: proj.id,
            serverName: proj.name,
            upvoteCount: upvoteData ? Number(upvoteData.count) : 0,
          }
        })
        .sort((a, b) => b.upvoteCount - a.upvoteCount)

      console.log("Projets avec des upvotes (triés):", serversWithUpvotes)

      // Réinitialiser rankGroups ici car il est déclaré à l'extérieur
      rankGroups = []
      let currentCount = -1
      let currentGroup: Array<{
        serverId: string
        serverName: string
        upvoteCount: number
      }> = []

      for (const serverData of serversWithUpvotes) {
        if (serverData.upvoteCount === 0) continue

        if (serverData.upvoteCount !== currentCount) {
          if (currentGroup.length > 0) {
            rankGroups.push(currentGroup)
          }
          currentCount = serverData.upvoteCount
          currentGroup = [serverData]
        } else {
          currentGroup.push(serverData)
        }
      }

      if (currentGroup.length > 0) {
        rankGroups.push(currentGroup)
      }

      console.log(`Groupes de classement formés: ${rankGroups.length} groupes`)

      let currentRank = 1
      let serversRanked = 0

      for (const group of rankGroups) {
        if (currentRank > 3) break

        console.log(
          `Groupe ${currentRank}: ${group.length} projets avec ${group[0].upvoteCount} upvotes chacun`,
        )

        for (const serverData of group) {
          await db
            .update(server)
            .set({
              dailyRanking: currentRank,
              updatedAt: now,
            })
            .where(eq(server.id, serverData.serverId))

          console.log(
            `Classé #${currentRank}: ${serverData.serverName} (${serverData.serverId}) avec ${serverData.upvoteCount} upvotes [ex-aequo: ${group.length > 1 ? "oui" : "non"}]`,
          )

          serversRanked++
        }
        currentRank++
      }
      console.log(`Total de projets classés: ${serversRanked}`)
    }

    // 4. Clean up abandoned PAYMENT_PENDING
    const abandonedPayments = await db
      .delete(server)
      .where(
        and(
          eq(server.launchStatus, launchStatus.PAYMENT_PENDING),
          lte(server.updatedAt, paymentDeadline),
        ),
      )
      .returning({ id: server.id, name: server.name })

    // Ajouter les types explicites pour reduce
    const totalRanked = rankGroups.reduce(
      (
        sum: number,
        group: Array<{
          serverId: string
          serverName: string
          upvoteCount: number
        }>,
      ) => sum + group.length,
      0,
    )

    console.log(`[${now.toISOString()}] Launch updates completed`)
    console.log(`- ${scheduledToOngoing.length} servers changed from SCHEDULED to ONGOING`)
    console.log(`- ${ongoingToLaunched.length} servers changed from ONGOING to LAUNCHED`)
    console.log(
      `- Top ${rankGroups.length > 0 ? Math.min(3, totalRanked) : 0} calculated from ${justLaunchedServerIds.length} servers launched yesterday`,
    )
    console.log(`- ${abandonedPayments.length} abandoned payments deleted for servers`)

    return NextResponse.json({
      message: "Launch statuses updated successfully.",
      details: {
        scheduledToOngoing: scheduledToOngoing.length,
        ongoingToLaunched: ongoingToLaunched.length,
        topCalculated: rankGroups.length > 0 ? Math.min(3, totalRanked) : 0,
        totalLaunchedYesterday: justLaunchedServerIds.length,
        abandonedPaymentsDeleted: abandonedPayments.length,
      },
    })
  } catch (error) {
    console.error("Error updating launch statuses:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
