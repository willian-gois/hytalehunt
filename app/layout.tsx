import type { Metadata } from "next"
import { Lexend as FontHeading, Nunito_Sans as FontSans } from "next/font/google"

import PlausibleProvider from "next-plausible"
import { Toaster } from "sonner"

import Footer from "@/components/layout/footer"
import Nav from "@/components/layout/nav"
import { ThemeProvider } from "@/components/theme/theme-provider"

import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = FontHeading({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  title: "HytaleHunt - Discover the Best Hytale Servers",
  description:
    "HytaleHunt is a platform to discover and upvote the best Hytale servers. Find top servers launching daily.",
  openGraph: {
    title: "HytaleHunt - Discover the Best Hytale Servers",
    description:
      "HytaleHunt is a platform to discover and upvote the best Hytale servers. Find top servers launching daily.",
    url: process.env.NEXT_PUBLIC_URL,
    siteName: "HytaleHunt",
    images: [
      {
				url: "og.webp",
        width: 1200,
        height: 630,
        alt: "HytaleHunt - Discover the Best Hytale Servers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HytaleHunt - Discover the Best Hytale Servers",
    description:
      "HytaleHunt is a platform to discover and upvote the best Hytale servers. Find top servers launching daily.",
		images: ["og.webp"],
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
        <PlausibleProvider
          domain="hytalehunt.com"
          customDomain="https://plausible.dailypings.com"
          selfHosted={true}
          trackOutboundLinks={true}
          scriptProps={{
            src: "https://plausible.dailypings.com/js/script.js",
          }}
          enabled={process.env.NODE_ENV === "production"}
        />
      </head>
      <body
        className={`font-sans antialiased ${fontSans.variable} ${fontHeading.variable} sm:overflow-y-scroll`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
      </body>
    </html>
  )
}
