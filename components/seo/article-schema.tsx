import Script from "next/script"

import { env } from "@/env"

interface ArticleSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: Date
  updatedAt: Date
  author?: string
  image?: string
}

export function ArticleSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  author = "HytaleHunt Team",
  image,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${env.NEXT_PUBLIC_URL}/blog/${slug}`,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${env.NEXT_PUBLIC_URL}/blog/${slug}`,
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
