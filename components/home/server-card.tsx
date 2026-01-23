"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { CopyIpButton } from "../server/copy-ip-button"
import { ServerLogoWithFallback } from "../server/server-logo-with-fallback"
import { ServerCardButtons } from "./server-card-buttons"

// Function to strip HTML tags from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

interface Category {
  id: string
  name: string
}

interface ServerCardProps {
  id: string
  slug: string
  name: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  upvoteCount: number
  commentCount: number
  launchStatus: string
  launchType?: string | null
  dailyRanking?: number | null
  index?: number
  userHasUpvoted: boolean
  categories: Category[]
  isAuthenticated: boolean
  websiteUrl?: string
  ipAddress?: string
}

export function ServerCard({
  id,
  slug,
  name,
  description,
  logoUrl,
  upvoteCount,
  commentCount,
  launchStatus,
  index,
  userHasUpvoted,
  categories,
  isAuthenticated,
  ipAddress,
}: ServerCardProps) {
  const router = useRouter()
  const serverPageUrl = `/servers/${slug}`

  return (
    <div
      className="group cursor-pointer rounded-xl p-3 transition-colors hover:bg-zinc-100/50 sm:p-4 dark:hover:bg-zinc-800/40"
      onClick={(e) => {
        e.stopPropagation()
        router.push(serverPageUrl)
      }}
    >
      <div className="flex flex-nowrap items-center gap-3 sm:gap-4">
        {/* 1. Ranking - Visible on sm+ */}
        <div className="hidden flex-shrink-0 items-center justify-center border-zinc-200/50 sm:flex dark:border-zinc-800/50">
          <span
            className={cn(
              "font-heading text-3xl font-black transition-all duration-300",
              index !== undefined && [
                index === 0 &&
                  "bg-gradient-to-br from-amber-200 via-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm",
                index === 1 &&
                  "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 bg-clip-text text-transparent",
                index === 2 &&
                  "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 bg-clip-text text-transparent",
                index > 2 && "text-zinc-400/20 group-hover:text-zinc-400/40",
              ],
              index === undefined && "text-zinc-400/20",
            )}
          >
            #{typeof index === "number" ? index + 1 : ""}
          </span>
        </div>

        {/* 2. Logo */}
        <div className="flex-shrink-0">
          <div className="relative flex items-center justify-center h-14 w-14 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:h-18 sm:w-18 dark:border-zinc-800 dark:bg-zinc-900">
            {logoUrl ? (
              <ServerLogoWithFallback logoUrl={logoUrl} name={name} className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-400">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* 3. Main Content Area */}
        <div className="min-w-0 flex-grow">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link href={serverPageUrl} onClick={(e) => e.stopPropagation()}>
                <h3 className="line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary sm:text-base">
                  {name}
                </h3>
              </Link>
              {ipAddress && (
                <CopyIpButton
                  ipAddress={ipAddress}
                  name={name}
                  variant={"secondary"}
                  size={"sm"}
                  className="h-5 px-1.5 text-[9px] font-medium"
                />
              )}
            </div>

            <p className="text-muted-foreground mb-1 line-clamp-2 text-xs sm:line-clamp-1 sm:text-sm">
              {stripHtml(description)}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5">
              {categories.length > 0 && (
                <Link
                  href={`/categories?category=${categories[0].id}`}
                  className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-600 uppercase transition-colors hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {categories[0].name}
                </Link>
              )}
              <div className="hidden items-center gap-1.5 sm:flex">
                {categories.slice(1, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories?category=${cat.id}`}
                    className="bg-secondary hover:bg-secondary-foreground/80 hover:text-secondary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {cat.name}
                  </Link>
                ))}
                {categories.length > 4 && (
                  <span className="text-muted-foreground text-[10px] font-medium">
                    +{categories.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Banner (Wide) - Hidden on mobile/tablet to prevent overlap */}
        {/* {bannerUrl && (
          <div className="relative hidden h-[60px] overflow-hidden rounded-lg lg:block lg:w-[300px] xl:w-[400px]">
            <ServerBannerWithLoader
              src={bannerUrl}
              alt={`${name} banner`}
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1280px) 300px, 400px"
            />
          </div>
        )} */}

        {/* 5. Stats/Buttons */}
        <div className="flex-shrink-0">
          <ServerCardButtons
            serverPageUrl={serverPageUrl}
            commentCount={commentCount}
            serverId={id}
            upvoteCount={upvoteCount}
            isAuthenticated={isAuthenticated}
            hasUpvoted={userHasUpvoted}
            launchStatus={launchStatus}
            serverName={name}
          />
        </div>
      </div>
    </div>
  )
}
