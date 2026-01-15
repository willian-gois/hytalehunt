"use server"

import { headers } from "next/headers"

import { db } from "@/drizzle/db"
import {
  category as categoryTable,
  fumaComments,
  launchStatus,
  launchType,
  server as serverTable,
  serverToCategory,
  upvote,
} from "@/drizzle/db/schema"
import { endOfMonth, startOfMonth } from "date-fns"
import { and, desc, eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { SERVER_LIMITS_VARIABLES } from "@/lib/constants"

async function getCurrentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

async function enrichServersWithUserData<T extends { id: string }>(
  servers: T[],
  userId: string | null,
): Promise<
  (T & {
    userHasUpvoted: boolean
    categories: { id: string; name: string }[]
  })[]
> {
  if (!servers.length) return []

  const serverIds = servers.map((p) => p.id)

  const categoriesData = await db
    .select({
      serverId: serverToCategory.serverId,
      categoryId: categoryTable.id,
      categoryName: categoryTable.name,
    })
    .from(serverToCategory)
    .innerJoin(categoryTable, eq(categoryTable.id, serverToCategory.categoryId))
    .where(sql`${serverToCategory.serverId} IN ${serverIds}`)

  const categoriesByServerId = categoriesData.reduce(
    (acc, row) => {
      if (!acc[row.serverId]) {
        acc[row.serverId] = []
      }
      acc[row.serverId].push({ id: row.categoryId, name: row.categoryName })
      return acc
    },
    {} as Record<string, { id: string; name: string }[]>,
  )

  let userUpvotedServerIds = new Set<string>()
  if (userId) {
    const userUpvotes = await db
      .select({ serverId: upvote.serverId })
      .from(upvote)
      .where(and(eq(upvote.userId, userId), sql`${upvote.serverId} IN ${serverIds}`))
    userUpvotedServerIds = new Set(userUpvotes.map((uv) => uv.serverId))
  }

  return servers.map((server) => ({
    ...server,
    userHasUpvoted: userUpvotedServerIds.has(server.id),
    categories: categoriesByServerId[server.id] || [],
  }))
}

export async function getTodayServers(limit: number = SERVER_LIMITS_VARIABLES.TODAY_LIMIT) {
  const userId = await getCurrentUserId()
  const todayServersBase = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      description: serverTable.description,
      logoUrl: serverTable.logoUrl,
      bannerUrl: serverTable.bannerUrl,
      ipAddress: serverTable.ipAddress,
      websiteUrl: serverTable.websiteUrl,
      launchStatus: serverTable.launchStatus,
      launchType: serverTable.launchType,
      dailyRanking: serverTable.dailyRanking,
      scheduledLaunchDate: serverTable.scheduledLaunchDate,
      createdAt: serverTable.createdAt,
      upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
      commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
    })
    .from(serverTable)
    .leftJoin(upvote, eq(upvote.serverId, serverTable.id))
    .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${serverTable.id}`)
    .where(eq(serverTable.launchStatus, launchStatus.ONGOING))
    .groupBy(serverTable.id)
    .orderBy(desc(sql`count(distinct ${upvote.id})`))
    .limit(limit)

  return enrichServersWithUserData(todayServersBase, userId)
}

export async function getYesterdayServers(limit: number = SERVER_LIMITS_VARIABLES.YESTERDAY_LIMIT) {
  const userId = await getCurrentUserId()
  const now = new Date()
  const isBeforeLaunchTime = now.getUTCHours() < 8
  const yesterdayStart = new Date(now)
  yesterdayStart.setUTCHours(8, 0, 0, 0)
  if (isBeforeLaunchTime) {
    yesterdayStart.setDate(yesterdayStart.getDate() - 2)
  } else {
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  }
  const yesterdayEnd = new Date(yesterdayStart)
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1)

  const yesterdayServersBase = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      description: serverTable.description,
      logoUrl: serverTable.logoUrl,
      websiteUrl: serverTable.websiteUrl,
      launchStatus: serverTable.launchStatus,
      launchType: serverTable.launchType,
      scheduledLaunchDate: serverTable.scheduledLaunchDate,
      createdAt: serverTable.createdAt,
      upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
      commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
      dailyRanking: serverTable.dailyRanking,
    })
    .from(serverTable)
    .leftJoin(upvote, eq(upvote.serverId, serverTable.id))
    .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${serverTable.id}`)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.scheduledLaunchDate} >= ${yesterdayStart.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} < ${yesterdayEnd.toISOString()}`,
      ),
    )
    .groupBy(serverTable.id)
    .orderBy(desc(sql`count(distinct ${upvote.id})`))
    .limit(limit)

  return enrichServersWithUserData(yesterdayServersBase, userId)
}

export async function getMonthBestServers(limit: number = SERVER_LIMITS_VARIABLES.MONTH_LIMIT) {
  const userId = await getCurrentUserId()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const monthServersBase = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      description: serverTable.description,
      logoUrl: serverTable.logoUrl,
      websiteUrl: serverTable.websiteUrl,
      launchStatus: serverTable.launchStatus,
      launchType: serverTable.launchType,
      dailyRanking: serverTable.dailyRanking,
      scheduledLaunchDate: serverTable.scheduledLaunchDate,
      createdAt: serverTable.createdAt,
      upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
      commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
    })
    .from(serverTable)
    .leftJoin(upvote, eq(upvote.serverId, serverTable.id))
    .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${serverTable.id}`)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.scheduledLaunchDate} >= ${monthStart.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} <= ${monthEnd.toISOString()}`,
      ),
    )
    .groupBy(serverTable.id)
    .orderBy(desc(sql`count(distinct ${upvote.id})`))
    .limit(limit)

  return enrichServersWithUserData(monthServersBase, userId)
}

export async function getFeaturedPremiumServers() {
  const servers = await db.query.server.findMany({
    where: and(
      eq(serverTable.featuredOnHomepage, true),
      eq(serverTable.launchType, launchType.PREMIUM_PLUS),
      eq(serverTable.launchStatus, launchStatus.ONGOING),
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      launchStatus: true,
      launchType: true,
      dailyRanking: true,
    },
    limit: 3,
    orderBy: [desc(serverTable.createdAt)],
  })
  return servers
}

export async function getYesterdayTopServers() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  const topServers = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      logoUrl: serverTable.logoUrl,
      dailyRanking: serverTable.dailyRanking,
    })
    .from(serverTable)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.dailyRanking} IS NOT NULL`,
        sql`${serverTable.scheduledLaunchDate} >= ${yesterday.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} <= ${yesterdayEnd.toISOString()}`,
      ),
    )
    .orderBy(serverTable.dailyRanking)
    .limit(3)

  return topServers
}

export async function getWinnersByDate(date: Date) {
  const userId = await getCurrentUserId()
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const winnersBase = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      description: serverTable.description,
      logoUrl: serverTable.logoUrl,
      websiteUrl: serverTable.websiteUrl,
      dailyRanking: serverTable.dailyRanking,
      launchStatus: serverTable.launchStatus,
      scheduledLaunchDate: serverTable.scheduledLaunchDate,
      createdAt: serverTable.createdAt,
      upvoteCount: sql<number>`cast(count(distinct ${upvote.id}) as int)`.mapWith(Number),
      commentCount: sql<number>`cast(count(distinct ${fumaComments.id}) as int)`.mapWith(Number),
    })
    .from(serverTable)
    .leftJoin(upvote, eq(upvote.serverId, serverTable.id))
    .leftJoin(fumaComments, sql`"fuma_comments"."page"::text = ${serverTable.id}`)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.dailyRanking} IS NOT NULL`,
        sql`${serverTable.dailyRanking} <= 3`,
        sql`${serverTable.scheduledLaunchDate} >= ${dayStart.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} <= ${dayEnd.toISOString()}`,
      ),
    )
    .groupBy(serverTable.id)
    .orderBy(serverTable.dailyRanking)

  return enrichServersWithUserData(winnersBase, userId)
}
