"use client"

import Link from "next/link"

import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"

import { ServerCard } from "./server-card"

interface Server {
  id: string
  slug: string
  name: string
  description: string
  logoUrl: string
  bannerUrl: string
  websiteUrl: string
  ipAddress: string
  upvoteCount: number
  commentCount?: number | null
  launchStatus: string
  launchType?: string | null
  scheduledLaunchDate?: Date | string | null
  createdAt: Date | string
  userHasUpvoted?: boolean
  categories?: { id: string; name: string }[]
  dailyRanking?: number | null
}

interface ServerSectionProps {
  title: string
  servers: Server[]
  moreHref?: string
  sortByUpvotes?: boolean
  isAuthenticated: boolean
  action?: React.ReactNode
}

export function ServerSection({
  title,
  servers,
  moreHref,
  sortByUpvotes = false,
  isAuthenticated,
  action,
}: ServerSectionProps) {
  const sortedServers = sortByUpvotes
    ? [...servers].sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0))
    : servers

  const ViewAllButton = () => (
    <Button variant="ghost" size="sm" className={"w-full justify-center text-sm sm:w-auto"} asChild>
      <Link href={moreHref!} className="flex items-center gap-1">
        View all <RiArrowRightLine className="h-4 w-4" />
      </Link>
    </Button>
  )

  const ViewAllButtonMobile = () => (
    <Button
      variant="ghost"
      size="sm"
      className={"bg-secondary w-full justify-center text-sm sm:w-auto"}
      asChild
    >
      <Link href={moreHref!} className="flex items-center gap-1">
        View all <RiArrowRightLine className="h-4 w-4" />
      </Link>
    </Button>
  )

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold sm:text-2xl">{title}</h2>
        {action ? (
          <div className="hidden sm:block">{action}</div>
        ) : (
          moreHref && (
            <div className="hidden sm:block">
              <ViewAllButton />
            </div>
          )
        )}
      </div>

      <div>
        {sortedServers.length > 0 ? (
          <div className="-mx-3 flex flex-col sm:-mx-4">
            {sortedServers.map((server, index) => (
              <ServerCard
                key={server.id}
                id={server.id}
                name={server.name}
                slug={server.slug}
                description={server.description || ""}
                logoUrl={server.logoUrl}
                bannerUrl={server.bannerUrl}
                upvoteCount={server.upvoteCount ?? 0}
                commentCount={server.commentCount ?? 0}
                launchStatus={server.launchStatus}
                launchType={server.launchType}
                dailyRanking={server.dailyRanking}
                userHasUpvoted={server.userHasUpvoted ?? false}
                categories={server.categories ?? []}
                isAuthenticated={isAuthenticated}
                index={index}
                websiteUrl={server.websiteUrl ?? undefined}
                ipAddress={server.ipAddress ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground border-border bg-card rounded-lg border border-dashed py-8 text-center text-sm">
            First server launch list in 01/19! Be the first!
            {/* {`No servers found for "${title}"`} */}
          </div>
        )}

        {action ? (
          <div className="mt-4 sm:hidden">{action}</div>
        ) : (
          moreHref && (
            <div className="mt-4 sm:hidden">
              <ViewAllButtonMobile />
            </div>
          )
        )}
      </div>
    </section>
  )
}
