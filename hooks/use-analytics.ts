"use client"

import { sendGAEvent } from "@next/third-parties/google"
import { usePostHog } from "posthog-js/react"

export type AnalyticsEventName =
  | "login"
  | "sign_up"
  | "begin_checkout"
  | "purchase"
  | "server_page_view"
  | "server_ip_copied"
  | "server_link_clicked"
  | "server_upvoted"
  | "server_downvoted"

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | object | null | undefined
>

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
      sendGAEvent("event", event, params || {})
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
