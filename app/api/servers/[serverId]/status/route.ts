import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { db } from "@/drizzle/db"
import { server as serverTable } from "@/drizzle/db/schema"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serverId = (await params).serverId

    // Récupérer la chaîne
    const [serverData] = await db
      .select({
        id: serverTable.id,
        slug: serverTable.slug,
        status: serverTable.launchStatus,
        createdBy: serverTable.createdBy,
      })
      .from(serverTable)
      .where(eq(serverTable.id, serverId))

    if (!serverData) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le propriétaire de la chaîne
    if (serverData.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      id: serverData.id,
      slug: serverData.slug,
      status: serverData.status,
    })
  } catch (error) {
    console.error("Error fetching server status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
