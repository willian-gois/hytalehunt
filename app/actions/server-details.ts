"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { and, eq, ne, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"

import { db } from "@/drizzle/db"
import { category, launchStatus, server, serverToCategory, upvote, user } from "@/drizzle/db/schema"

// Get session helper
async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

// Get server by slug
export async function getServerBySlug(slug: string) {
  // Get server details - Exclure les projets avec le statut payment_pending
  const [serverData] = await db
    .select()
    .from(server)
    .where(and(eq(server.slug, slug), ne(server.launchStatus, launchStatus.PAYMENT_PENDING)))
    .limit(1)

  if (!serverData) {
    return null
  }

  // Get creator information if available
  let creator = null
  if (serverData.createdBy) {
    const [creatorData] = await db
      .select()
      .from(user)
      .where(eq(user.id, serverData.createdBy))
      .limit(1)
    creator = creatorData
  }

  // Get categories
  const categories = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category)
    .innerJoin(serverToCategory, eq(category.id, serverToCategory.categoryId))
    .where(eq(serverToCategory.serverId, serverData.id))

  // Get upvote count
  const [upvoteCount] = await db
    .select({
      count: sql`count(*)`,
    })
    .from(upvote)
    .where(eq(upvote.serverId, serverData.id))

  // Ne plus récupérer les commentaires ici car ils seront gérés par Fuma Comment

  return {
    ...serverData,
    categories,
    upvoteCount: Number(upvoteCount?.count || 0),
    creator,
    // Ne plus inclure les commentaires dans l'objet retourné
  }
}

// Check if a user has upvoted a server
export async function hasUserUpvoted(serverId: string) {
  const session = await getSession()

  if (!session?.user?.id) {
    return false
  }

  const userUpvotes = await db
    .select()
    .from(upvote)
    .where(and(eq(upvote.userId, session.user.id), eq(upvote.serverId, serverId)))
    .limit(1)

  return userUpvotes.length > 0
}

// Update server description and categories
// Only allowed for server owners and only if server is in "scheduled" status
export async function updateServer(
  serverId: string,
  data: {
    description: string
    categories: string[]
  },
) {
  const session = await getSession()

  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }

  try {
    // Get server to check ownership and status
    const [serverData] = await db.select().from(server).where(eq(server.id, serverId)).limit(1)

    if (!serverData) {
      return { success: false, error: "Server not found" }
    }

    // Check if user is the owner
    if (serverData.createdBy !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to edit this server",
      }
    }

    // Check if server is in scheduled status
    if (serverData.launchStatus !== "scheduled") {
      return {
        success: false,
        error: "You can only edit servers that are scheduled for launch",
      }
    }

    // Update description
    await db
      .update(server)
      .set({
        description: data.description,
        updatedAt: new Date(),
      })
      .where(eq(server.id, serverId))

    // Update categories (remove old ones and add new ones)
    // First, delete existing categories
    await db.delete(serverToCategory).where(eq(serverToCategory.serverId, serverId))

    // Then add new categories
    if (data.categories.length > 0) {
      await db.insert(serverToCategory).values(
        data.categories.map((categoryId) => ({
          serverId: serverId,
          categoryId,
        })),
      )
    }

    // Revalidate the server page
    revalidatePath(`/servers/${serverData.slug}`)

    return {
      success: true,
      message: "Server updated successfully",
    }
  } catch (error) {
    console.error("Error updating server:", error)
    return {
      success: false,
      error: "Failed to update server",
    }
  }
}
