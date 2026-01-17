"use server"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { launchStatus, server as serverTable } from "@/drizzle/db/schema"

// Récupérer les projets gagnants pour une date spécifique
export async function getWinnersByDate(date: Date) {
  // Créer le début et la fin de la journée
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const winners = await db
    .select({
      id: serverTable.id,
      name: serverTable.name,
      slug: serverTable.slug,
      logoUrl: serverTable.logoUrl,
      description: serverTable.description,
      dailyRanking: serverTable.dailyRanking,
      scheduledLaunchDate: serverTable.scheduledLaunchDate,
    })
    .from(serverTable)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.dailyRanking} IS NOT NULL`,
        sql`${serverTable.scheduledLaunchDate} >= ${dayStart.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} <= ${dayEnd.toISOString()}`,
      ),
    )
    .orderBy(serverTable.dailyRanking)

  return winners
}

// Vérifier si une date a des gagnants
export async function dateHasWinners(date: Date) {
  // Créer le début et la fin de la journée
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const result = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(serverTable)
    .where(
      and(
        eq(serverTable.launchStatus, launchStatus.LAUNCHED),
        sql`${serverTable.dailyRanking} IS NOT NULL`,
        sql`${serverTable.scheduledLaunchDate} >= ${dayStart.toISOString()}`,
        sql`${serverTable.scheduledLaunchDate} <= ${dayEnd.toISOString()}`,
      ),
    )

  return result?.[0]?.count > 0
}
