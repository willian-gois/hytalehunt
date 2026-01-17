import Script from "next/script"

import { LAUNCH_SETTINGS } from "@/lib/constants"

import { env } from "@/env"

interface FAQItem {
  id: string
  title: string
  content: string
}

interface PricingSchemaProps {
  faqItems: FAQItem[]
}

export function PricingSchema({ faqItems }: PricingSchemaProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "HytaleHunt Server Launch",
    provider: {
      "@type": "Organization",
      name: "HytaleHunt",
      url: env.NEXT_PUBLIC_URL,
    },
    description:
      "Launch your Hytale server with visibility, upvotes, and community growth through our flexible launch packages",
    offers: [
      {
        "@type": "Offer",
        name: "Free Launch",
        description:
          "Standard launch with featured placement on homepage and potential dofollow backlink for top performers",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${env.NEXT_PUBLIC_URL}/pricing`,
      },
      {
        "@type": "Offer",
        name: "Premium Launch",
        description:
          "Priority scheduling with guaranteed high authority dofollow backlink and earlier launch dates",
        price: LAUNCH_SETTINGS.PREMIUM_PRICE.toString(),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${env.NEXT_PUBLIC_URL}/pricing`,
      },
      {
        "@type": "Offer",
        name: "SEO Growth Package",
        description:
          "Premium launch plus custom SEO article for Google ranking with high authority backlink",
        price: LAUNCH_SETTINGS.ARTICLE_PRICE.toString(),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${env.NEXT_PUBLIC_URL}/pricing`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.content,
      },
    })),
  }

  return (
    <>
      <Script
        id="pricing-service-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="pricing-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
