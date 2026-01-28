"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { useAnalytics } from "@/hooks/use-analytics"

export function DashboardTrackPurchase() {
  const { track } = useAnalytics()
  const searchParams = useSearchParams()

  const checkoutSuccess = searchParams.get("checkout") === "success"

  useEffect(() => {
    if (track && checkoutSuccess) {
      track("purchase", {})
    }
  }, [track, checkoutSuccess])

  return null
}

export function SuspendedDashboardTrackPurchase() {
  return (
    <Suspense fallback={null}>
      <DashboardTrackPurchase />
    </Suspense>
  )
}
