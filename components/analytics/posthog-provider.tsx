"use client"

import { useEffect } from "react"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"

import { SuspendedPostHogPageView } from "./posthog-pageview"
import { env } from "@/env"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        defaults: "2025-11-30",
        person_profiles: "identified_only",
        persistence: "localStorage+cookie",
        capture_exceptions: true,
        autocapture: false,
        capture_pageview: false, // We'll capture pageviews manually for better control
        capture_pageleave: true,
        disable_session_recording: false,
        before_send: (event) => {
          console.log(event)
          if (env.NEXT_PUBLIC_APP_ENV !== "production") {
            console.log("[PostHog] [DEVELOPMENT] Skipping event", event)
            return null
          }
          return event
        },
        loaded: (client) => {
          if (env.NEXT_PUBLIC_APP_ENV !== "production") {
            console.log("[PostHog] [DEVELOPMENT] Opting out of capturing")
            client.debug(true)
            client.opt_out_capturing()
          }
        },
      })
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}
