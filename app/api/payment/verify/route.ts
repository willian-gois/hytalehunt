import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"
import Stripe from "stripe"

import { db } from "@/drizzle/db"
import { server } from "@/drizzle/db/schema"
import { env } from "@/env"

// Initialiser le client Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
})

export async function GET(request: Request) {
  try {
    // Récupérer l'ID de session des paramètres de requête
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 })
    }

    // Récupérer les détails de la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Récupérer l'ID du projet depuis la session
    const serverId = session.client_reference_id

    if (!serverId) {
      return NextResponse.json({ error: "No server ID found in session" }, { status: 400 })
    }

    // Vérifier le statut du paiement
    if (session.payment_status === "paid") {
      // Récupérer les informations du projet
      const [serverData] = await db
        .select({
          id: server.id,
          slug: server.slug,
          launchStatus: server.launchStatus,
        })
        .from(server)
        .where(eq(server.id, serverId))

      if (!serverData) {
        return NextResponse.json({ error: "Server not found" }, { status: 404 })
      }

      return NextResponse.json({
        status: "complete",
        serverId: serverData.id,
        serverSlug: serverData.slug,
        launchStatus: serverData.launchStatus,
      })
    } else if (session.payment_status === "unpaid") {
      return NextResponse.json({ status: "pending" })
    } else {
      return NextResponse.json({ status: "failed" })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
