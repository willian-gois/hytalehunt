"use client"

import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useTheme } from "next-themes"
import { usePostHog } from "posthog-js/react"

import { useSession } from "@/lib/auth-client"

export function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const { data: session, isPending } = useSession()
  const { theme } = useTheme()

  // Register global properties that will be sent with all events
  useEffect(() => {
    if (posthog && theme) {
      posthog.register({
        theme_mode: theme,
      })
    }
  }, [posthog, theme])

  // Identify user when logged in
  useEffect(() => {
    if (isPending) return

    if (session?.user && posthog) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      })
    } else if (!session && posthog) {
      posthog.reset()
    }
  }, [session, isPending, posthog])

  // Capture pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = `${url}?${searchParams.toString()}`
      }
      posthog.capture("$pageview", {
        $current_url: url,
      })
    }
  }, [pathname, searchParams, posthog])

  return null
}

export function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageview />
    </Suspense>
  )
}
