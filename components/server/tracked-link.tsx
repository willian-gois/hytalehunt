"use client"

import {
  type AnalyticsEventName,
  type AnalyticsEventParams,
  useAnalytics,
} from "@/hooks/use-analytics"

type TrackedLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  href: string
  event: AnalyticsEventName
  properties?: AnalyticsEventParams
}

export function TrackedLink({ href, event, properties, children, ...props }: TrackedLinkProps) {
  const { track } = useAnalytics()

  return (
    <a
      href={href}
      onClick={() => {
        track(event, properties)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
