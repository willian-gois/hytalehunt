"use client"

import { Suspense, useEffect } from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function ServerPageView({ id }: { id: string }) {
  const { track } = useAnalytics()

  useEffect(() => {
    if (track) {
      track("server_page_view", {
        server_id: id,
      })
    }
  }, [id, track])

  return null
}

export function SuspendedServerPageView({ id }: { id: string }) {
  return (
    <Suspense fallback={null}>
      <ServerPageView id={id} />
    </Suspense>
  )
}
