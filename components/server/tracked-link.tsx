"use client"

import { usePostHog } from "posthog-js/react"

type TrackedLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  href: string
  event: string
  properties?: Record<string, unknown>
}

export function TrackedLink({ href, event, properties, children, ...props }: TrackedLinkProps) {
  const posthog = usePostHog()

  return (
    <a
      href={href}
      onClick={() => {
        posthog.capture(event, properties)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
