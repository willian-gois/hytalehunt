import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { eq, sql } from "drizzle-orm"
import Stripe from "stripe"

import { db } from "@/drizzle/db"
import { launchQuota, launchStatus, launchType, server } from "@/drizzle/db/schema"

// Initialiser le client Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature") as string

    // Vérifier la signature du webhook
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Traiter l'événement
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Find the server using client_reference_id (which we set as serverId)
      const serverId = session.client_reference_id
      if (!serverId) {
        console.error("No server ID found in session metadata")
        return NextResponse.json(
          { error: "No server ID found in session metadata" },
          { status: 400 },
        )
      }

      // Vérifier si le paiement a réussi
      if (session.payment_status === "paid") {
        // Récupérer les informations de la chaîne
        const [serverData] = await db
          .select({
            id: server.id,
            launchType: server.launchType,
            scheduledLaunchDate: server.scheduledLaunchDate,
          })
          .from(server)
          .where(eq(server.id, serverId))

        if (!serverData) {
          console.error("Server not found:", serverId)
          return NextResponse.json({ error: "Server not found" }, { status: 404 })
        }

        if (!serverData.scheduledLaunchDate) {
          console.error("Server data incomplete:", serverId)
          return NextResponse.json({ error: "Server data incomplete" }, { status: 400 })
        }

        // Update the server status to 'scheduled'
        await db
          .update(server)
          .set({
            launchStatus: launchStatus.SCHEDULED,
            // Pour Premium Plus, activer la mise en avant sur la page d'accueil
            featuredOnHomepage: serverData.launchType === launchType.PREMIUM_PLUS,
            updatedAt: new Date(),
          })
          .where(eq(server.id, serverId))

        // Mettre à jour le quota pour cette date
        const launchDate = serverData.scheduledLaunchDate
        const quotaResult = await db
          .select()
          .from(launchQuota)
          .where(eq(launchQuota.date, launchDate))
          .limit(1)

        if (quotaResult.length === 0) {
          // Créer un nouveau quota
          await db.insert(launchQuota).values({
            id: crypto.randomUUID(),
            date: launchDate,
            freeCount: 0,
            premiumCount: serverData.launchType === launchType.PREMIUM ? 1 : 0,
            premiumPlusCount: serverData.launchType === launchType.PREMIUM_PLUS ? 1 : 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        } else {
          // Mettre à jour le quota existant
          await db
            .update(launchQuota)
            .set({
              premiumCount:
                serverData.launchType === launchType.PREMIUM
                  ? sql`${launchQuota.premiumCount} + 1`
                  : launchQuota.premiumCount,
              premiumPlusCount:
                serverData.launchType === launchType.PREMIUM_PLUS
                  ? sql`${launchQuota.premiumPlusCount} + 1`
                  : launchQuota.premiumPlusCount,
              updatedAt: new Date(),
            })
            .where(eq(launchQuota.id, quotaResult[0].id))
        }

        // Revalidate the server page path using the server ID
        try {
          revalidatePath(`/servers`) // Revalidation plus large pour l'instant
          console.log(`Revalidated path for server: ${serverId}`)
        } catch (revalidateError) {
          console.error("Error revalidating path:", revalidateError)
        }

        return NextResponse.json({ success: true })
      } else {
        // Si le paiement n'a pas réussi, mettre à jour le statut à PAYMENT_FAILED
        await db
          .update(server)
          .set({
            launchStatus: launchStatus.PAYMENT_FAILED,
            updatedAt: new Date(),
          })
          .where(eq(server.id, serverId))

        return NextResponse.json({ success: true })
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session
      const serverId = session.client_reference_id

      if (serverId) {
        // Mettre à jour le statut de la chaîne à PAYMENT_FAILED
        await db
          .update(server)
          .set({
            launchStatus: launchStatus.PAYMENT_FAILED,
            updatedAt: new Date(),
          })
          .where(eq(server.id, serverId))
      }

      return NextResponse.json({ success: true })
    }

    // Pour les autres types d'événements
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
