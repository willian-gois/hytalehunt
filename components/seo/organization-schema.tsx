import { env } from "@/env"

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HytaleHunt",
    url: env.NEXT_PUBLIC_URL,
    logo: `${env.NEXT_PUBLIC_URL}/logo.png`,
    description:
      "HytaleHunt is a platform to discover and upvote the best Hytale servers. Find top servers launching daily.",
    sameAs: [
      "https://twitter.com/hytalehunt",
      // "https://discord.gg/...",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: env.NEXT_PUBLIC_CONTACT_EMAIL,
      contactType: "Customer Service",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HytaleHunt",
    url: env.NEXT_PUBLIC_URL,
    description:
      "HytaleHunt is a platform to discover and upvote the best Hytale servers. Find top servers launching daily.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${env.NEXT_PUBLIC_URL}/categories?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
