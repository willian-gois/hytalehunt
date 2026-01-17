import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { server } from "@/drizzle/db/schema"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Normaliser l'URL pour la comparaison
    const normalizedUrl = url.toLowerCase().replace(/\/$/, "")

    // Vérifier si l'URL existe déjà
    const [existingServer] = await db
      .select({ id: server.id, launchStatus: server.launchStatus })
      .from(server)
      .where(eq(server.websiteUrl, normalizedUrl))

    // If no server found, the URL is available
    if (!existingServer) {
      return NextResponse.json({ exists: false })
    }

    // If a server exists but is in PAYMENT_PENDING or PAYMENT_FAILED,
    // we consider the URL as available to allow re-submission
    if (
      existingServer.launchStatus === "payment_pending" ||
      existingServer.launchStatus === "payment_failed"
    ) {
      return NextResponse.json({ exists: false })
    }

    // In all other cases, the URL is considered taken
    return NextResponse.json({ exists: true })
  } catch (error) {
    console.error("Error checking URL:", error)
    return NextResponse.json({ error: "Failed to check URL" }, { status: 500 })
  }
}
