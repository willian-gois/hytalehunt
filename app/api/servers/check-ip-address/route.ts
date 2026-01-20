import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { server } from "@/drizzle/db/schema"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ipAddress = searchParams.get("ipAddress")

    if (!ipAddress) {
      return NextResponse.json({ error: "IP Address parameter is required" }, { status: 400 })
    }

    // Normaliser l'IP Address pour la comparaison
    const normalizedIpAddress = ipAddress.toLowerCase().replace(/\/$/, "")

    // Vérifier si l'IP Address existe déjà
    const [existingServer] = await db
      .select({ id: server.id, launchStatus: server.launchStatus })
      .from(server)
      .where(eq(server.ipAddress, normalizedIpAddress))

    // If no server found, the IP Address is available
    if (!existingServer) {
      return NextResponse.json({ exists: false })
    }

    // If a server exists but is in PAYMENT_PENDING or PAYMENT_FAILED,
    // we consider the IP Address as available to allow re-submission
    if (
      existingServer.launchStatus === "payment_pending" ||
      existingServer.launchStatus === "payment_failed"
    ) {
      return NextResponse.json({ exists: false })
    }

    // In all other cases, the IP Address is considered taken
    return NextResponse.json({ exists: true })
  } catch (error) {
    console.error("Error checking IP Address:", error)
    return NextResponse.json({ error: "Failed to check IP Address" }, { status: 500 })
  }
}
