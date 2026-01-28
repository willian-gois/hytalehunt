"use client"

import { usePostHog } from "posthog-js/react"

export type AnalyticsEventName =
  | "login"
  | "sign_up"
  | "begin_checkout"
  | "purchase"
  | "server_page_view"
  | "server_link_clicked"
  | "server_upvoted"
  | "server_downvoted"

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
      console.log("Tracking event with Google Analytics:", event, params)
      console.log(window.gtag)
      window.gtag("event", event, params)
    }

    // PostHog
    if (options.posthog && posthog) {
      console.log("Tracking event with PostHog:", event, params)
      posthog.capture(event, params)
    }
  }

  return {
    track,
  }
}
