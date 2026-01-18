import type { Metadata } from "next"
import { Cinzel as FontHeading, Nunito_Sans as FontSans } from "next/font/google"

import { Toaster } from "sonner"

import { PostHogProvider } from "@/components/analytics/posthog-provider"
import Footer from "@/components/layout/footer"
import Nav from "@/components/layout/nav"
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/organization-schema"
import { ThemeProvider } from "@/components/theme/theme-provider"

import { env } from "@/env"

import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = FontHeading({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600"],
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_URL),
  title: "HytaleHunt - Discover the Best Hytale Servers (Daily updated)",
  description:
    "Discover and upvote the best Hytale servers. Find top servers list launching daily. Browse survival, PvP, minigames and more modes.",
  keywords: [
    "hytale",
    "hytale servers",
    "hytale server list",
    "minecraft",
    "gaming servers",
    "multiplayer servers",
    "pvp servers",
    "survival servers",
    "server directory",
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
    title: "HytaleHunt - Discover the Best Hytale Servers (Daily updated)",
    description:
      "Discover and upvote the best Hytale servers. Find top servers list launching daily. Browse survival, PvP, minigames and more modes.",
    url: env.NEXT_PUBLIC_URL,
    siteName: "HytaleHunt",
    images: [
      {
        url: "og.webp",
        width: 1200,
        height: 630,
        alt: "HytaleHunt - Discover the Best Hytale Servers (Daily updated)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HytaleHunt - Discover the Best Hytale Servers (Daily updated)",
    description:
      "Discover and upvote the best Hytale servers. Find top servers list launching daily. Browse survival, PvP, minigames and more modes.",
    images: ["og.webp"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <PlausibleProvider
          domain="hytalehunt.com"
          customDomain="https://plausible.hytelehunt.com"
          selfHosted={true}
          trackOutboundLinks={true}
          scriptProps={{
            src: "https://plausible.hytelehunt.com/js/script.js",
          }}
          enabled={env.NODE_ENV === "production"}
        /> */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body
        className={`font-sans antialiased ${fontSans.variable} ${fontHeading.variable} sm:overflow-y-scroll`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-dvh flex-col">
              <Nav />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  )
}
