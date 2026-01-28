"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { LAUNCH_SETTINGS } from "@/lib/constants"
import { useAnalytics } from "@/hooks/use-analytics"

export function DashboardTrackPurchase() {
  const { track } = useAnalytics()
  const searchParams = useSearchParams()

  const checkoutSuccess = searchParams.get("checkout") === "success"
  const utmContent = searchParams.get("utm_content")

  useEffect(() => {
    if (track && checkoutSuccess) {
      const price: Record<string, number> = {
        premium: LAUNCH_SETTINGS.PREMIUM_PRICE,
        "premium-sponsorship-weekly":
          LAUNCH_SETTINGS.PREMIUM_PRICE + LAUNCH_SETTINGS.SPONSOR_WEEKLY_PRICE,
        "premium-sponsorship-monthly":
          LAUNCH_SETTINGS.PREMIUM_PRICE + LAUNCH_SETTINGS.SPONSOR_MONTHLY_PRICE,
      }

      // Gambiarra pra sabermos os itens e respectivo preços através do utm_content, repassado pelo Stripe
      track("purchase", {
        currency: "USD",
        value: utmContent ? price[utmContent] : LAUNCH_SETTINGS.PREMIUM_PRICE,
        transaction_id: crypto.randomUUID(),
        items: [
          {
            item_name: "Premium Launch",
            price: LAUNCH_SETTINGS.PREMIUM_PRICE,
          },
          ...(utmContent && utmContent === "premium-sponsorship-weekly"
            ? [
                {
                  item_name: "Weekly Sponsorship",
                  price: LAUNCH_SETTINGS.SPONSOR_WEEKLY_PRICE,
                },
              ]
            : []),
          ...(utmContent && utmContent === "premium-sponsorship-monthly"
            ? [
                {
                  item_name: "Monthly Sponsorship",
                  price: LAUNCH_SETTINGS.SPONSOR_MONTHLY_PRICE,
                },
              ]
            : []),
        ],
      })
    }
  }, [track, checkoutSuccess, utmContent])

  return null
}

export function SuspendedDashboardTrackPurchase() {
  return (
    <Suspense fallback={null}>
      <DashboardTrackPurchase />
    </Suspense>
  )
}
