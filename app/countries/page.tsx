import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { RiArrowDownSLine, RiFilterLine } from "@remixicon/react"
import { countries } from "country-data-list"
import { CircleFlag } from "react-circle-flags"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileCountrySelector } from "@/components/countries/mobile-country-selector"
import { ServerCard } from "@/components/home/server-card"
import { getAllCountries, getServersByCountry, getTopCountries } from "@/app/actions/servers"

export const metadata: Metadata = {
  title: "Browse Servers by Country - HytaleHunt",
  description:
    "Browse Hytale servers by country. Find servers from United States, Brazil, United Kingdom, Germany, and more countries worldwide.",
  keywords: [
    "hytale servers by country",
    "us servers",
    "brazil servers",
    "uk servers",
    "germany servers",
    "france servers",
    "canada servers",
    "australia servers",
    "japan servers",
    "regional servers",
    "country servers",
    "hytale server locations",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Browse Servers by Country - HytaleHunt",
    description:
      "Browse Hytale servers by country. Find servers from United States, Brazil, United Kingdom, Germany, and more countries worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Servers by Country - HytaleHunt",
    description:
      "Browse Hytale servers by country. Find servers from United States, Brazil, United Kingdom, Germany, and more countries worldwide.",
  },
  alternates: {
    canonical: "/countries",
  },
}

// Skeleton component for server cards
function ServerCardSkeleton() {
  return (
    <div className="mx-3 animate-pulse rounded-xl border border-zinc-100 bg-white/70 p-3 shadow-sm sm:mx-4 sm:p-4 dark:border-zinc-800/50 dark:bg-zinc-900/30">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <div className="bg-muted h-12 w-12 rounded-md sm:h-14 sm:w-14"></div>
        </div>
        <div className="min-w-0 flex-grow">
          <div className="flex flex-col">
            <div className="bg-muted mb-2 h-5 w-1/3 rounded"></div>
            <div className="bg-muted h-4 w-2/3 rounded"></div>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
          <div className="bg-muted h-10 w-10 rounded-xl border-2 border-dashed"></div>
          <div className="bg-muted hidden h-10 w-10 rounded-xl border-2 border-dashed sm:block"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton component for country header
function CountryHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="bg-muted h-8 w-48 animate-pulse rounded"></div>
      <div className="bg-muted h-8 w-24 animate-pulse rounded"></div>
    </div>
  )
}

function CountryDataSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <CountryHeaderSkeleton />
      <div className="-mx-3 flex flex-col sm:-mx-4">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <ServerCardSkeleton key={index} />
          ))}
      </div>
    </div>
  )
}

async function CountryData({
  countryCode,
  sort = "recent",
  page = 1,
}: {
  countryCode: string
  sort?: string
  page?: number
}) {
  const ITEMS_PER_PAGE = 10
  const currentPage = Math.max(1, page)

  const { servers: paginatedServers, totalCount } = await getServersByCountry(
    countryCode,
    currentPage,
    ITEMS_PER_PAGE,
    sort,
  )

  const isAuthenticated =
    paginatedServers.length > 0 ? typeof paginatedServers[0].userHasUpvoted === "boolean" : false

  // Resolve country name from code
  const countryData = countries.all.find((c) => c.alpha2 === countryCode)
  if (!countryData) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Country not found.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const getSortLabel = () => {
    switch (sort) {
      case "upvotes":
        return "Most Upvotes"
      case "alphabetical":
        return "A-Z"
      // case "recent":
      default:
        return "Most Recent"
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleFlag countryCode={countryCode.toLowerCase()} height={32} className="w-5 h-5" />
          <h2 className="text-xl font-bold sm:text-2xl">{countryData.name}</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <RiFilterLine className="h-3.5 w-3.5" />
              <span className="hidden md:block">{getSortLabel()}</span>
              <RiArrowDownSLine className="text-muted-foreground ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link
                href={`/countries?country=${countryCode}&sort=recent&page=1`}
                className={sort === "recent" || !sort ? "bg-muted/50 font-medium" : ""}
              >
                Most Recent
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/countries?country=${countryCode}&sort=upvotes&page=1`}
                className={sort === "upvotes" ? "bg-muted/50 font-medium" : ""}
              >
                Most Upvotes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/countries?country=${countryCode}&sort=alphabetical&page=1`}
                className={sort === "alphabetical" ? "bg-muted/50 font-medium" : ""}
              >
                Alphabetical
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {totalCount === 0 ? (
        <div className="text-muted-foreground border-border bg-card rounded-lg border border-dashed py-8 text-center text-sm">
          No servers from {countryData.name} yet.
          <p className="mt-2">Check other countries or come back later.</p>
        </div>
      ) : (
        <div className="-mx-3 flex flex-col sm:-mx-4">
          {paginatedServers.map((server, index) => (
            <ServerCard
              key={server.id}
              id={server.id}
              slug={server.slug}
              name={server.name}
              description={server.description || ""}
              logoUrl={server.logoUrl || ""}
              bannerUrl={server.bannerUrl || ""}
              websiteUrl={server.websiteUrl ?? undefined}
              upvoteCount={server.upvoteCount ?? 0}
              commentCount={server.commentCount ?? 0}
              launchStatus={server.launchStatus}
              launchType={server.launchType}
              dailyRanking={server.dailyRanking}
              index={index}
              isAuthenticated={isAuthenticated}
              userHasUpvoted={server.userHasUpvoted ?? false}
              categories={server.categories ?? []}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-4 border-t pt-4">
          <Button asChild variant="outline" size="sm" disabled={currentPage <= 1}>
            <Link
              href={`/countries?country=${countryCode}${sort ? `&sort=${sort}` : ""}&page=${currentPage - 1}`}
              aria-disabled={currentPage <= 1}
              className={` ${
                currentPage <= 1
                  ? "text-muted-foreground hover:text-muted-foreground pointer-events-none cursor-not-allowed opacity-50"
                  : ""
              } `}
            >
              Previous
            </Link>
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages}>
            <Link
              href={`/countries?country=${countryCode}${sort ? `&sort=${sort}` : ""}&page=${currentPage + 1}`}
              aria-disabled={currentPage >= totalPages}
              className={` ${
                currentPage >= totalPages
                  ? "text-muted-foreground hover:text-muted-foreground pointer-events-none cursor-not-allowed opacity-50"
                  : ""
              } `}
            >
              Next
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; sort?: string; page?: string }>
}) {
  const allCountryCodes = await getAllCountries()
  const countriesWithCount = await getTopCountries(100)

  const params = await searchParams

  // Default to US if it exists, otherwise first country
  const defaultCountry = allCountryCodes.includes("US")
    ? "US"
    : allCountryCodes.length > 0
      ? allCountryCodes[0]
      : ""

  const selectedCountryCode = params.country || defaultCountry
  const sortParam = params.sort || "recent"
  const pageParam = parseInt(params.page || "1", 10)

  // Build country options with names and counts
  const countryOptions = countriesWithCount
    .map((c) => {
      const countryData = countries.all.find((country) => country.alpha2 === c.country)
      return {
        code: c.country,
        name: countryData?.name || c.country,
        count: c.count,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="bg-secondary/20">
      <div className="container mx-auto min-h-screen max-w-6xl px-4 pt-8 pb-12">
        <div className="mb-6 flex flex-col">
          <h1 className="text-2xl font-bold">Hytale Servers by Country</h1>

          <MobileCountrySelector
            countries={countryOptions}
            selectedCountryCode={selectedCountryCode}
            sortParam={sortParam}
          />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            <Suspense fallback={<CountryDataSkeleton />}>
              {selectedCountryCode ? (
                <CountryData countryCode={selectedCountryCode} sort={sortParam} page={pageParam} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No countries available yet.</p>
                </div>
              )}
            </Suspense>
          </div>

          <div className="top-24 hidden lg:block">
            <div className="space-y-3 py-5 pt-0">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">Browse Countries</h3>
              </div>
              <div className="-mx-2 max-h-[520px] space-y-2 overflow-y-auto pr-2">
                {countryOptions.map((country) => (
                  <Link
                    key={country.code}
                    href={`/countries?country=${country.code}${sortParam ? `&sort=${sortParam}` : ""}&page=1`}
                    className={`flex items-center justify-between rounded-md p-2 ${
                      country.code === selectedCountryCode
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CircleFlag
                        countryCode={country.code.toLowerCase()}
                        height={24}
                        className="w-5 h-5"
                      />
                      <span>{country.name}</span>
                    </div>
                    <span className="text-muted-foreground bg-secondary rounded-full px-2 py-0.5 text-xs">
                      {country.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 py-5">
              <h3 className="flex items-center gap-2 font-semibold">Quick Access</h3>
              <div className="space-y-2">
                <Link
                  href="/trending"
                  className="-mx-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:underline"
                >
                  Trending Now
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
