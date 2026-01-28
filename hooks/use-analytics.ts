"use client"

import { usePostHog } from "posthog-js/react"

export type AnalyticsEventName = "begin_checkout"

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>

type TrackOptions = {
  google?: boolean
  posthog?: boolean
}

const defaultOptions: TrackOptions = {
  google: true,
  posthog: true,
}

export function useAnalytics() {
  const posthog = usePostHog()

  function track(
    event: AnalyticsEventName,
    params?: AnalyticsEventParams,
    options: TrackOptions = defaultOptions,
  ) {
    if (typeof window === "undefined") return

    // Google Analytics (GA4)
    if (options.google && "gtag" in window) {
      window.gtag("event", event, params)
    }

    // PostHog
    if (options.posthog && posthog) {
      posthog.capture(event, params)
    }
  }

  return {
    track,
  }
}
