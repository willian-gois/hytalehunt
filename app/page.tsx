/* eslint-disable @next/next/no-img-element */
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"

import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ServerSection } from "@/components/home/server-section"
import { SponsorCards } from "@/components/shared/sponsor-cards"
import { getMonthBestServers, getTodayServers, getYesterdayServers } from "@/app/actions/home"
import { getLast30DaysPageviews, getLast30DaysVisitors } from "@/app/actions/plausible"
import { getTopCategories } from "@/app/actions/servers"

export default async function Home() {
  // Récupérer les données réelles
  const todayServers = await getTodayServers()
  const yesterdayServers = await getYesterdayServers()
  const monthServers = await getMonthBestServers()
  const topCategories = await getTopCategories(5)

  const last30DaysVisitors = await getLast30DaysVisitors()
  const last30DaysPageviews = await getLast30DaysPageviews()

  // // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <main className="bg-muted/30 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          {/* Contenu principal */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            {/* Welcome */}
            <div className="bg-secondary/70 hover:bg-secondary border-border/40 relative z-10 overflow-hidden rounded-lg border">
              <div className="container mx-auto max-w-6xl px-4 py-3 md:py-4">
                {/* Mobile Layout - Centered */}
                <div className="flex flex-col items-center justify-center gap-3 md:hidden">
                  <Link href="/pricing" className="flex cursor-pointer flex-col gap-2 text-center">
                    <div>
                      <h1 className="text-foreground text-base font-semibold">
                        <span>Launch platform for your products</span>
                      </h1>
                      <p className="text-muted-foreground text-xs">
                        <span>Submit, get a badge & backlink</span>
                      </p>
                    </div>
                  </Link>
                  {/* <div>
                    <a
                      href="https://frogdr.com/hytalehunt.com?utm_source=hytalehunt.com"
                      target="_blank"
                    >
                      Light mode badge
                      <img
                        src="https://frogdr.com/hytalehunt.com/badge-white-sm.svg?round=1"
                        alt="Monitor your Domain Rating with FrogDR"
                        className="h-6 w-auto dark:hidden"
                      />
                      Dark mode badge
                      <img
                        src="https://frogdr.com/hytalehunt.com/badge-dark-sm.svg?round=1"
                        alt="Monitor your Domain Rating with FrogDR"
                        className="hidden h-6 w-auto dark:block"
                      />
                    </a>
                  </div> */}
                </div>

                {/* Desktop Layout - Text left, Image right */}

                <div className="hidden items-center justify-center gap-12 md:flex">
                  {/* image 1 */}
                  <div className="flex-shrink-0">
                    <img
                      src="/oppieG.png"
                      alt="HytaleHunt Character"
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                  {/* text */}
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Link href="/pricing" className="cursor-pointer">
                      <h1 className="text-foreground text-lg font-semibold">
                        <span>Launch platform for your products</span>
                      </h1>
                      <p className="text-muted-foreground text-sm">
                        <span>Submit, get a badge & backlink</span>
                      </p>
                    </Link>
                    {/* <div>
                      <a
                        href="https://frogdr.com/hytalehunt.com?utm_source=hytalehunt.com"
                        target="_blank"
                      >
                        Light mode badge
                        <img
                          src="https://frogdr.com/hytalehunt.com/badge-white-sm.svg?round=1"
                          alt="Monitor your Domain Rating with FrogDR"
                          className="h-7 w-auto dark:hidden"
                        />
                        Dark mode badge
                        <img
                          src="https://frogdr.com/hytalehunt.com/badge-dark-sm.svg?round=1"
                          alt="Monitor your Domain Rating with FrogDR"
                          className="hidden h-7 w-auto dark:block"
                        />
                      </a>
                    </div> */}
                  </div>

                  {/* image 2 */}
                  <div className="flex-shrink-0">
                    <img
                      src="/oppieD.png"
                      alt="HytaleHunt Character"
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <ServerSection
              title="Top Servers Launching Today"
              servers={todayServers}
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
            />

            <ServerSection
              title="Yesterday's Launches"
              servers={yesterdayServers}
              moreHref="/trending?filter=yesterday"
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
            />

            <ServerSection
              title="This Month's Best"
              servers={monthServers}
              moreHref="/trending?filter=month"
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
            />
          </div>

          {/* Sidebar */}
          <div className="top-24">
            {/* Statistics */}
            {(last30DaysVisitors !== null || last30DaysPageviews !== null) && (
              <div className="space-y-3 pt-0 pb-4">
                <h3 className="flex items-center gap-2 font-semibold">Statistics (Last 30 Days)</h3>

                <div className="grid grid-cols-2 gap-4">
                  {last30DaysVisitors !== null && (
                    <div className="hover:bg-muted/40 rounded-md border p-2 text-center transition-colors">
                      <div className="text-xl font-bold">{last30DaysVisitors}</div>
                      <div className="text-muted-foreground text-xs font-medium">Visitors</div>
                    </div>
                  )}

                  {last30DaysPageviews !== null && (
                    <div className="hover:bg-muted/40 rounded-md border p-2 text-center transition-colors">
                      <div className="text-xl font-bold">{last30DaysPageviews}</div>
                      <div className="text-muted-foreground text-xs font-medium">Page Views</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Sponsors */}
            <div className="space-y-3 py-4">
              <h3 className="flex items-center font-semibold">Sponsors</h3>
              <SponsorCards />
            </div>

            {/* Categories */}
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">Top Categories</h3>
                <Button variant="ghost" size="sm" className="text-sm" asChild>
                  <Link href="/categories" className="flex items-center gap-1">
                    View all
                  </Link>
                </Button>
              </div>
              <div className="space-y-2">
                {topCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories?category=${category.id}`}
                    className={cn(
                      "-mx-2 flex items-center justify-between rounded-md p-2",
                      category.id === "all" ? "bg-muted font-medium" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/images/categories/${category.id}.webp`}
                        alt={category.name}
                        width={24}
                        height={24}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-muted-foreground bg-secondary rounded-full px-2 py-0.5 text-xs">
                      {category.count} servers
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Podium
            {yesterdayServers.length > 0 && (
              <div className="p-5 pt-0 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  Yesterday&apos;s Top Launches
                </h3>
                <TopLaunchesPodium topServers={yesterdayServers} />
              </div>
            )} */}

            {/* Quick Links */}
            <div className="space-y-3 py-4">
              <h3 className="flex items-center gap-2 font-semibold">Quick Access</h3>
              <div className="space-y-2">
                {session?.user && (
                  <Link
                    href="/dashboard"
                    className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/trending"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Trending Now
                </Link>
                <Link
                  href="/winners"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Daily Winners
                </Link>
                <Link
                  href="/trending?filter=month"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Best of Month
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
