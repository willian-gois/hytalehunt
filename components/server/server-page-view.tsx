"use client"

import { Suspense, useEffect } from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function ServerPageView({ id, name }: { id: string; name: string }) {
  const { track } = useAnalytics()

  useEffect(() => {
    if (track) {
      track("server_page_view", {
        server_id: id,
        server_name: name,
      })
    }
  }, [id, name, track])

  return null
}

export function SuspendedServerPageView({ id, name }: { id: string; name: string }) {
  return (
    <Suspense fallback={null}>
      <ServerPageView id={id} name={name} />
    </Suspense>
  )
}
