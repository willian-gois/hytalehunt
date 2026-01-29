/* eslint-disable @next/next/no-img-element */
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"

import { countries as countryData } from "country-data-list"
import { CircleFlag } from "react-circle-flags"

import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/categories/category-icon"
import { HowItWorksModal } from "@/components/home/how-it-works-modal"
import { ServerSection } from "@/components/home/server-section"
import { WelcomeBanner } from "@/components/home/welcome-banner"
import { SponsorCards } from "@/components/shared/sponsor-cards"
import { getMonthBestServers, getTodayServers, getYesterdayServers } from "@/app/actions/home"
import { getTopCategories, getTopCountries } from "@/app/actions/servers"

export default async function Home() {
  const [todayServers, yesterdayServers, monthServers, topCategories, countries] =
    await Promise.all([
      getTodayServers(),
      getYesterdayServers(),
      getMonthBestServers(),
      getTopCategories(5),
      getTopCountries(5),
    ])

  // const last30DaysVisitors = await getLast30DaysVisitors()
  // const last30DaysPageviews = await getLast30DaysPageviews()

  // // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <main className="bg-muted/30 min-h-screen">
      <WelcomeBanner />
      <div className="container mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          {/* Contenu principal */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            {/* Welcome */}
            <div className="bg-secondary/70 hover:bg-secondary border-border/40 relative z-10 overflow-hidden rounded-lg border">
              {/* Mobile Layout - Centered */}
              <div className="md:hidden">
                <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-lg bg-[url('/images/banner.webp')] bg-cover bg-center px-4 py-6 text-center">
                  <div className="relative z-10 flex cursor-pointer flex-col gap-2">
                    <h1 className="text-background font-heading text-lg font-semibold drop-shadow-[0_5px_16px_rgba(0,0,0,0.65)]">
                      <span>Discover the best Hytale servers</span>
                    </h1>
                    <p className="text-background text-sm drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                      <span>Daily ranked by the community</span>
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="HytaleHunt Logo"
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              {/* Desktop Layout - Text left, Image right */}
              <div className="hidden w-full items-center justify-between gap-12 bg-[url('/images/banner.webp')] bg-cover bg-center bg-no-repeat px-8 py-6 md:relative md:flex md:overflow-hidden">
                {/* text */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="cursor-pointer">
                    <h1 className="text-background font-heading text-2xl font-bold">
                      <span>Discover the best Hytale servers</span>
                    </h1>
                    <p className="text-background text-md">
                      <span>Daily ranked by the community</span>
                    </p>
                  </div>
                </div>

                {/* logo */}
                <div className="relative z-10 flex h-full items-center justify-center md:justify-start">
                  <Image
                    src="/logo.png"
                    alt="HytaleHunt Logo"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <ServerSection
              title="Top Servers Launching Today"
              servers={todayServers}
              sortByUpvotes={true}
              isAuthenticated={!!session?.user}
              action={<HowItWorksModal />}
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
            {/* {(last30DaysVisitors !== null || last30DaysPageviews !== null) && (
              <div className="space-y-3 pt-0 pb-4">
                <h3 className="font-heading flex items-center gap-2 font-semibold">
                  Statistics (Last 30 Days)
                </h3>

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
            )} */}
            {/* Sponsors */}
            <div className="space-y-3 py-4">
              <h3 className="font-heading flex items-center font-semibold">Sponsors</h3>
              <SponsorCards />
            </div>

            {/* Categories */}
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading flex items-center gap-2 font-semibold">
                  Top Categories
                </h3>
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
                      <CategoryIcon categoryId={category.id} categoryName={category.name} />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-muted-foreground bg-secondary rounded-full px-2 py-0.5 text-xs">
                      {category.count} servers
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading flex items-center gap-2 font-semibold">
                  Top Countries
                </h3>
                <Button variant="ghost" size="sm" className="text-sm" asChild>
                  <Link href="/countries" className="flex items-center gap-1">
                    View all
                  </Link>
                </Button>
              </div>
              <div className="space-y-2">
                {countries.map((country) => (
                  <Link
                    key={country.country}
                    href={`/countries?country=${country.country}`}
                    className={cn(
                      "-mx-2 flex items-center justify-between rounded-md p-2",
                      country.country === "all" ? "bg-muted font-medium" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CircleFlag
                        countryCode={country.country.toLowerCase()}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span>
                        {countryData.all.find((c) => c.alpha2 === country.country)?.name ||
                          country.country}
                      </span>
                    </div>
                    <span className="text-muted-foreground bg-secondary rounded-full px-2 py-0.5 text-xs">
                      {country.count} servers
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Podium
            {yesterdayServers.length > 0 && (
              <div className="p-5 pt-0 space-y-3">
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  Yesterday&apos;s Top Launches
                </h3>
                <TopLaunchesPodium topServers={yesterdayServers} />
              </div>
            )} */}

            {/* Quick Links */}
            <div className="space-y-3 py-4">
              <h3 className="font-heading flex items-center gap-2 font-semibold">Quick Access</h3>
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
