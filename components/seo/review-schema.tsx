import Script from "next/script"

import { env } from "@/env"

interface ReviewSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: Date
  updatedAt: Date
  author?: string
  image?: string
}

export function ReviewSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  author = "HytaleHunt Team",
  image,
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: title,
    description,
    url: `${env.NEXT_PUBLIC_URL}/reviews/${slug}`,
    datePublished: publishedAt.toISOString(),
    dateModified: updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "HytaleHunt",
      url: env.NEXT_PUBLIC_URL,
      logo: {
        "@type": "ImageObject",
        url: `${env.NEXT_PUBLIC_URL}/logo.png`,
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  }

  return (
    <Script
      id="review-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
