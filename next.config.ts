import type { NextConfig } from "next"

import createMDX from "@next/mdx"
import type { PluggableList } from "unified"

import { env } from "./env"

const nextConfig: NextConfig = {
  /* config options here */

  // Configuration pour MDX
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      ...(env.NEXT_PUBLIC_UPLOADTHING_URL
        ? [
            {
              protocol: "https" as const,
              hostname: env.NEXT_PUBLIC_UPLOADTHING_URL,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  // PostHog reverse proxy configuration
  async rewrites() {
    return [
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
    ]
  },
}

const withMDX = createMDX({
  options: {
    // Turbopack requires MDX loader options to be serializable. Passing the
    // plugin name instead of the function keeps the configuration compatible.
    remarkPlugins: ["remark-gfm"] as unknown as PluggableList,
  },
})

// Combine MDX and Next.js config
export default withMDX(nextConfig)
