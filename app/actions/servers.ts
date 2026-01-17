"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { and, asc, count, desc, eq, or, type SQL, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"

import { db } from "@/drizzle/db"
import {
  category as categoryTable,
  fumaComments,
  server,
  server as serverTable,
  serverToCategory,
  upvote,
} from "@/drizzle/db/schema"

// Fonction pour générer un slug unique
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  // Vérifier si le slug existe déjà dans la table server
  const existingServer = await db.query.server.findFirst({
    where: eq(serverTable.slug, baseSlug),
  })

  if (!existingServer) {
    return baseSlug
  }

  // Si le slug existe, ajouter un nombre aléatoire
  const randomSuffix = Math.floor(Math.random() * 10000)
  return `${baseSlug}-${randomSuffix}`
}

// Get session helper
async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

// Get all categories
export async function getAllCategories() {
  const categories = await db.select().from(categoryTable).orderBy(categoryTable.name)
  return categories
}

// Get top categories based on server count
export async function getTopCategories(limit = 5) {
  const topCategories = await db
    .select({
      id: categoryTable.id,
      name: categoryTable.name,
      count: count(serverToCategory.serverId),
    })
    .from(categoryTable)
    .leftJoin(serverToCategory, eq(categoryTable.id, serverToCategory.categoryId))
    .leftJoin(server, eq(serverToCategory.serverId, server.id))
    .where(or(eq(server.launchStatus, "ongoing"), eq(server.launchStatus, "launched")))
    .groupBy(categoryTable.id, categoryTable.name)
    .orderBy(desc(count(serverToCategory.serverId)))
    .limit(limit)

  return topCategories
}

// Get user's upvoted servers
export async function getUserUpvotedServers() {
  const session = await getSession()

  if (!session?.user?.id) {
    return []
  }

  const upvotedServers = await db
    .select({
      server: serverTable,
      upvotedAt: upvote.createdAt,
    })
    .from(upvote)
    .innerJoin(serverTable, eq(upvote.serverId, serverTable.id))
    .where(eq(upvote.userId, session.user.id))
    .orderBy(desc(upvote.createdAt))
    .limit(10)

  return upvotedServers
}

// La fonction getUserComments ne devrait plus être nécessaire car gérée par Fuma Comment
export async function getUserComments() {
  return []
}

// Get servers created by user
export async function getUserCreatedServers() {
  const session = await getSession()

  if (!session?.user?.id) {
    return []
  }

  const userServers = await db
    .select()
    .from(serverTable)
    .where(eq(serverTable.createdBy, session.user.id))
    .orderBy(desc(serverTable.createdAt))
    .limit(10)

  return userServers
}

// Toggle upvote on a server
export async function toggleUpvote(serverId: string) {
  const session = await getSession()

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to upvote",
    }
  }

  // Importer les constantes et le module de rate limiting
  const { UPVOTE_LIMITS } = await import("@/lib/constants")
  const rateLimit = await import("@/lib/rate-limit")

  // Rate limiting pour les upvotes en utilisant les constantes
  const { success, reset } = await rateLimit.checkRateLimit(
    `upvote:${session.user.id}`,
    UPVOTE_LIMITS.ACTIONS_PER_WINDOW,
    UPVOTE_LIMITS.TIME_WINDOW_MS,
  )

  if (!success) {
    return {
      success: false,
      message: `Anti-Spam Squad here: ${UPVOTE_LIMITS.ACTIONS_PER_WINDOW} upvotes in ${UPVOTE_LIMITS.TIME_WINDOW_MINUTES} minutes maxed out! Retry in ${reset} seconds.`,
    }
  }

  // Vérifier si l'utilisateur a déjà fait une action sur ce server récemment
  const lastAction = await db.query.upvote.findFirst({
    where: and(eq(upvote.userId, session.user.id), eq(upvote.serverId, serverId)),
    orderBy: [desc(upvote.createdAt)],
  })

  // Si une action existe et a été créée il y a moins de X secondes (défini dans les constantes), bloquer
  if (lastAction?.createdAt) {
    const timeSinceLastAction = Date.now() - lastAction.createdAt.getTime()
    if (timeSinceLastAction < UPVOTE_LIMITS.MIN_TIME_BETWEEN_ACTIONS_MS) {
      return {
        success: false,
        message: `Anti-Spam Squad here: ${UPVOTE_LIMITS.MIN_TIME_BETWEEN_ACTIONS_SECONDS}-second wait required for vote changes`,
      }
    }
  }

  // Check if the user has already upvoted the server
  const existingUpvote = await db
    .select()
    .from(upvote)
    .where(and(eq(upvote.userId, session.user.id), eq(upvote.serverId, serverId)))
    .limit(1)

  // If upvote exists, remove it, otherwise add it
  if (existingUpvote.length > 0) {
    await db
      .delete(upvote)
      .where(and(eq(upvote.userId, session.user.id), eq(upvote.serverId, serverId)))
  } else {
    await db.insert(upvote).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      serverId,
      createdAt: new Date(),
    })
  }

  revalidatePath("/dashboard")
  // Temporairement commenter la revalidation spécifique au projet
  // Il faudrait le slug ici pour revalider /servers/{slug}
  // revalidatePath(`/servers/${serverSlug}`);

  return { success: true }
}

// Définir l'interface ici
interface ServerSubmissionData {
  name: string
  description: string
  ipAddress: string
  websiteUrl: string
  logoUrl: string
  bannerUrl: string
  categories: string[]
  mods: string[]
  discordUrl?: string | null
  twitterUrl?: string | null
  version: string
  country: string
}

// Version correcte de submitServer
export async function submitServer(serverData: ServerSubmissionData) {
  const session = await getSession()

  if (!session?.user) {
    return { success: false, error: "Authentication required" }
  }

  try {
    // Utiliser les données de serverData
    const {
      name,
      description,
      ipAddress,
      websiteUrl,
      logoUrl,
      bannerUrl,
      categories,
      mods,
      discordUrl,
      twitterUrl,
      version,
      country,
    } = serverData

    // Validation
    if (!name || !description || !websiteUrl || categories.length === 0) {
      return { success: false, error: "Missing required fields" }
    }

    // Générer le slug à partir du nom dans serverData
    const slug = await generateUniqueSlug(name)

    // Insérer le projet
    const [newServer] = await db
      .insert(serverTable)
      .values({
        id: crypto.randomUUID(),
        // Utiliser les variables déstructurées de serverData
        name,
        slug,
        description,
        ipAddress,
        websiteUrl,
        logoUrl,
        bannerUrl,
        mods,
        discordUrl: discordUrl ?? undefined,
        twitterUrl: twitterUrl ?? undefined,
        version,
        country,
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: serverTable.id, slug: serverTable.slug })

    // Ajouter les catégories
    if (categories.length > 0) {
      await db.insert(serverToCategory).values(
        categories.map((categoryId) => ({
          serverId: newServer.id,
          categoryId,
        })),
      )
    }

    return { success: true, serverId: newServer.id, slug: newServer.slug }
  } catch (error) {
    console.error("Error submitting server:", error)
    return { success: false, error: "Failed to submit server" }
  }
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

  // Récupérer les catégories pour tous les projets
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

  // Récupérer les upvotes de l'utilisateur
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

// Get servers by category with pagination and sorting
export async function getServersByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10,
  sort: string = "recent",
) {
  const session = await getSession()
  const userId = session?.user?.id || null

  let orderByClause: SQL
  switch (sort) {
    case "upvotes":
      orderByClause = desc(sql`count(distinct ${upvote.id})`)
      break
    case "alphabetical":
      orderByClause = asc(serverTable.name)
      break
    // case "recent":
    default:
      orderByClause = desc(serverTable.createdAt)
      break
  }

  const offset = (page - 1) * limit

  const queryConditions = and(
    eq(serverToCategory.categoryId, categoryId),
    or(eq(serverTable.launchStatus, "ongoing"), eq(serverTable.launchStatus, "launched")),
  )

  const serversData = await db
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
      upvoteCount: sql<number>`count(distinct ${upvote.id})`.mapWith(Number),
      commentCount: sql<number>`count(distinct ${fumaComments.id})`.mapWith(Number),
    })
    .from(serverTable)
    .innerJoin(serverToCategory, eq(serverTable.id, serverToCategory.serverId))
    .leftJoin(upvote, eq(upvote.serverId, serverTable.id))
    .leftJoin(fumaComments, sql`(${fumaComments.page}::text = ${serverTable.id}::text)`)
    .where(queryConditions)
    .groupBy(
      serverTable.id,
      serverTable.name,
      serverTable.slug,
      serverTable.description,
      serverTable.logoUrl,
      serverTable.websiteUrl,
      serverTable.launchStatus,
      serverTable.launchType,
      serverTable.dailyRanking,
      serverTable.scheduledLaunchDate,
      serverTable.createdAt,
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)

  const enrichedServers = await enrichServersWithUserData(serversData, userId)

  const totalServersResult = await db
    .select({ count: count(serverTable.id) })
    .from(serverTable)
    .innerJoin(serverToCategory, eq(serverTable.id, serverToCategory.serverId))
    .where(queryConditions)

  const totalCount = totalServersResult[0]?.count || 0

  return {
    servers: enrichedServers,
    totalCount,
  }
}

// getCategoryById
export async function getCategoryById(categoryId: string) {
  const categoryData = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.id, categoryId))
    .limit(1)

  return categoryData[0] || null
}
