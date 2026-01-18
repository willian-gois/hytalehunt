/* eslint-disable @next/next/no-img-element */
import type { Metadata, ResolvingMetadata } from "next"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { RiDiscordFill, RiHashtag, RiTwitterFill, RiVipCrownLine } from "@remixicon/react"
import { format } from "date-fns"

import { auth } from "@/lib/auth"

import { Button } from "@/components/ui/button"
import { RichTextDisplay } from "@/components/ui/rich-text-editor"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { CopyIpButton } from "@/components/server/copy-ip-button"
import { EditButton } from "@/components/server/edit-button"
import { ServerBannerWithLoader } from "@/components/server/server-banner-with-loader"
import { ServerComments } from "@/components/server/server-comments"
import { ShareButton } from "@/components/server/share-button"
import { UpvoteButton } from "@/components/server/upvote-button"
import { SponsorCards } from "@/components/shared/sponsor-cards"
import { getServerBySlug, hasUserUpvoted } from "@/app/actions/server-details"

import { env } from "@/env"

// Types
interface ServerPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  { params }: ServerPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const serverData = await getServerBySlug(slug)

  if (!serverData) {
    return {
      title: "Server Not Found",
    }
  }

  // Function to strip HTML tags from text
  function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").trim()
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${serverData.name} | HytaleHunt`,
    description: stripHtml(serverData.description),
    keywords: [
      "hytale server",
      serverData.name,
      `${serverData.name} server`,
      `${serverData.name} hytale server`,
      "minecraft server",
      "gaming server",
      "multiplayer",
      "hytale",
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
      title: `${serverData.name} on HytaleHunt`,
      description: stripHtml(serverData.description),
      images: [serverData.bannerUrl || serverData.logoUrl, ...previousImages],
    },
    twitter: {
      card: "summary_large_image",
      title: `${serverData.name} on HytaleHunt`,
      description: stripHtml(serverData.description),
      images: [serverData.bannerUrl || serverData.logoUrl],
    },
    alternates: {
      canonical: `/servers/${slug}`,
    },
  }
}

export default async function ServerPage({ params }: ServerPageProps) {
  const { slug } = await params
  const serverData = await getServerBySlug(slug)

  if (!serverData) {
    notFound()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const hasUpvoted = session?.user ? await hasUserUpvoted(serverData.id) : false

  const scheduledDate = serverData.scheduledLaunchDate
    ? new Date(serverData.scheduledLaunchDate)
    : null

  const isActiveLaunch = serverData.launchStatus === "ongoing"

  const isScheduled = serverData.launchStatus === "scheduled"

  const isOwner = session?.user?.id === serverData.createdBy

  // const websiteRelAttribute = getServerWebsiteRelAttribute({
  //   launchStatus: serverData.launchStatus,
  //   launchType: serverData.launchType,
  //   dailyRanking: serverData.dailyRanking,
  // })

  const breadcrumbItems = [
    { name: "Home", url: env.NEXT_PUBLIC_URL },
    { name: "Servers", url: `${env.NEXT_PUBLIC_URL}/categories` },
    { name: serverData.name, url: `${env.NEXT_PUBLIC_URL}/servers/${serverData.slug}` },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content - 2 colonnes */}
            <div className="lg:col-span-2">
              {/* Modern Clean Header */}
              <div className="py-6">
                {/* Version Desktop */}
                <div className="hidden items-center justify-between md:flex">
                  {/* Left side: Logo + Title + Categories */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Logo */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-transparent">
                      <Image
                        src={serverData.logoUrl}
                        alt={`${serverData.name} Logo`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>

                    {/* Title and info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h1 className="text-foreground truncate text-xl font-bold">
                          {serverData.name}
                        </h1>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-1">
                        {serverData.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories?category=${category.id}`}
                            className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
                          >
                            <RiHashtag className="h-3 w-3" />
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Actions */}
                  <div className="ml-6 flex items-center gap-3">
                    {/* {serverData.websiteUrl && (
                    <Button variant="outline" size="sm" asChild className="h-9 px-3">
                      <a
                        href={serverData.websiteUrl}
                        target="_blank"
                        rel={websiteRelAttribute}
                        className="flex items-center gap-2"
                      >
                        <RiGlobalLine className="h-4 w-4" />
                        Copy IP
                      </a>
                    </Button>
                  )} */}
                    {serverData.ipAddress && (
                      <CopyIpButton ipAddress={serverData.ipAddress} name={serverData.name} />
                    )}

                    {isActiveLaunch ? (
                      <UpvoteButton
                        serverId={serverData.id}
                        upvoteCount={serverData.upvoteCount}
                        initialUpvoted={hasUpvoted}
                        isAuthenticated={Boolean(session?.user)}
                      />
                    ) : (
                      <div className="border-muted bg-muted flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium">
                        <span className="text-foreground">{serverData.upvoteCount} upvotes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Version Mobile */}
                <div className="space-y-4 md:hidden">
                  {/* Logo + Titre */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-transparent">
                      <Image
                        src={serverData.logoUrl}
                        alt={`${serverData.name} Logo`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h1 className="text-foreground text-xl font-bold">{serverData.name}</h1>
                      <div className="flex flex-wrap gap-1">
                        {serverData.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories?category=${category.id}`}
                            className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
                          >
                            <RiHashtag className="h-3 w-3" />
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions - Same width buttons side by side */}
                  <div className="flex gap-3">
                    {serverData.ipAddress && (
                      <CopyIpButton ipAddress={serverData.ipAddress} name={serverData.name} />
                    )}

                    {isActiveLaunch ? (
                      <UpvoteButton
                        serverId={serverData.id}
                        upvoteCount={serverData.upvoteCount}
                        initialUpvoted={hasUpvoted}
                        isAuthenticated={Boolean(session?.user)}
                      />
                    ) : (
                      <div className="border-muted bg-muted flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium">
                        <span className="text-foreground">{serverData.upvoteCount} upvotes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 pb-12">
                {/* Badge SVG pour les gagnants top 3 uniquement */}
                {isOwner &&
                  serverData.launchStatus === "launched" &&
                  serverData.dailyRanking &&
                  serverData.dailyRanking <= 3 && (
                    <div className="border-primary/30 bg-primary/10 text-primary flex flex-col items-center justify-between gap-2 rounded-lg border p-2 sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-center text-sm font-medium">
                        Congratulations! You earned a badge for your ranking.
                      </span>
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Link href={`/servers/${serverData.slug}/badges`}>
                          <RiVipCrownLine className="h-4 w-4" />
                          View Badges
                        </Link>
                      </Button>
                    </div>
                  )}

                {/* Scheduled Launch Info */}
                {isScheduled && scheduledDate && (
                  <div className="flex flex-col items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 sm:flex-row sm:items-center sm:gap-3 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                    <div className="text-center sm:text-left">
                      <p className="font-medium">This server is scheduled for launch</p>
                      <p className="text-sm opacity-90">
                        Launch date: {format(scheduledDate, "EEEE, MMMM d, yyyy")} at 08:00 AM UTC
                      </p>
                    </div>
                    <div className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      Scheduled
                    </div>
                  </div>
                )}

                {/* Banner */}
                {serverData.bannerUrl && (
                  <ServerBannerWithLoader
                    src={serverData.bannerUrl}
                    alt={`${serverData.name} - Server Banner`}
                  />
                )}
                {/* Description */}
                <div className="w-full">
                  <RichTextDisplay content={serverData.description} />
                </div>

                {/* Edit button pour owners */}
                {isOwner && (
                  <div>
                    <EditButton
                      serverId={serverData.id}
                      initialDescription={serverData.description}
                      initialCategories={serverData.categories}
                      isOwner={isOwner}
                      isScheduled={isScheduled}
                    />
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold" id="comments">
                    Comments
                  </h2>
                  {serverData.launchStatus === "ongoing" ||
                  serverData.launchStatus === "launched" ? (
                    <ServerComments serverId={serverData.id} />
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground">
                        Comments will be available once the server is launched.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 colonne sur toute la hauteur */}
            <div className="lg:sticky lg:top-14 lg:h-fit">
              <div className="space-y-6 py-6">
                {/* Achievement Badge */}
                {serverData.launchStatus === "launched" &&
                  serverData.dailyRanking &&
                  serverData.dailyRanking <= 3 && (
                    <div className="space-y-3">
                      <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Achievement
                      </h3>
                      <div className="flex">
                        <Image
                          src={`/images/badges/top${serverData.dailyRanking}-light.webp`}
                          alt={`HytaleHunt Top ${serverData.dailyRanking} Daily Winner`}
                          width={195}
                          height={48}
                          className="h-12 w-auto dark:hidden"
                        />
                        <Image
                          src={`/images/badges/top${serverData.dailyRanking}-dark.webp`}
                          alt={`HytaleHunt Top ${serverData.dailyRanking} Daily Winner`}
                          width={195}
                          height={48}
                          className="hidden h-12 w-auto dark:block"
                        />
                      </div>
                    </div>
                  )}

                {/* Publisher */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Publisher
                  </h3>
                  <div className="flex items-center gap-3">
                    {serverData.creator ? (
                      <>
                        {serverData.creator.image ? (
                          <Image
                            src={serverData.creator.image}
                            alt={serverData.creator.name || "Creator avatar"}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                            {serverData.creator.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-medium">
                            {serverData.creator.name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unknown creator</span>
                    )}
                  </div>
                </div>

                {/* Launch Date */}
                {scheduledDate && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Launch Date
                      </span>
                      <div className="border-muted-foreground/30 mx-3 flex-1 border-b border-dotted"></div>
                      <span className="text-foreground text-sm font-medium">
                        {format(scheduledDate, "yyyy-MM-dd")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Discord */}
                {serverData.discordUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Discord
                      </span>
                      <div className="border-muted-foreground/30 mx-3 flex-1 border-b border-dotted"></div>
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={serverData.discordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <RiDiscordFill className="h-4 w-4" />
                          Join
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Twitter */}
                {serverData.twitterUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Twitter
                      </span>
                      <div className="border-muted-foreground/30 mx-3 flex-1 border-b border-dotted"></div>
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={serverData.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <RiTwitterFill className="h-4 w-4" />
                          Follow
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mods */}
                {serverData.mods && serverData.mods.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      Mods
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {serverData.mods.slice(0, 6).map((mods) => (
                        <span
                          key={mods}
                          className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs"
                        >
                          #{mods}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="border-border border-t pt-4">
                  <ShareButton name={serverData.name} slug={serverData.slug} variant="fullWidth" />
                </div>

                {/* Sponsors */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Sponsors
                  </h3>
                  <SponsorCards />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
