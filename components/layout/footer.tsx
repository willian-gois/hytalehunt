/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

import { RiTwitterXFill } from "@remixicon/react"
import { countries } from "country-data-list"
import { CircleFlag } from "react-circle-flags"

import { CategoryIcon } from "@/components/categories/category-icon"
import { getTopCategories, getTopCountries } from "@/app/actions/servers"

// Link groups for a columnar layout
const discoverLinks = [
  { title: "Trending", href: "/trending" },
  { title: "Submit Server", href: "/servers/submit" },
]

const resourcesLinks = [
  { title: "Pricing", href: "/pricing" },
  { title: "Sponsors", href: "/sponsors" },
  { title: "Blog", href: "/blog" },
]

const legalLinks = [
  { title: "Terms of Service", href: "/legal/terms" },
  { title: "Privacy Policy", href: "/legal/privacy" },
]

// Liens pour la nouvelle colonne "Connect"
const connectLinkItems = [
  {
    href: "https://x.com/williangoix",
    icon: RiTwitterXFill,
    label: "Twitter / X",
  },
]

export default async function FooterSection() {
  const [topCategories, topCountriesData] = await Promise.all([
    getTopCategories(8),
    getTopCountries(6),
  ])

  // Map countries to include names
  const topCountriesWithNames = topCountriesData.map((c) => {
    const countryData = countries.all.find((country) => country.alpha2 === c.country)
    return {
      code: c.country,
      name: countryData?.name || c.country,
    }
  })

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HytaleHunt",
    description:
      "Discover and explore the best Hytale servers. Browse by categories, find trending servers, and join the community.",
    url: "https://hytalehunt.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hytalehunt.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    sameAs: ["https://x.com/williangoix"],
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <footer className="bg-background border-t pt-6 pb-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-x-8">
            {/* Left Section: Brand, Description, Copyright, Badges */}
            <div className="flex flex-col items-start text-left md:col-span-4 lg:col-span-4">
              <Link href="/" className="font-heading mb-3 flex items-center">
                <span className="font-heading flex items-center text-lg font-bold">
                  <img src="/logo.webp" alt="HytaleHunt Logo" className="mr-1 h-6 w-6" />
                  HytaleHunt
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                Discover and explore the best Hytale servers. Browse by categories, find trending
                servers, and join the community.
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                © {new Date().getFullYear()} HytaleHunt. All rights reserved.
              </p>
              <div className="flex items-center justify-start space-x-3">
                <img
                  src="/images/badges/top1-light.webp"
                  alt="Top 1 Product Badge (Light Theme)"
                  className="block w-[200px] dark:hidden"
                />
                <img
                  src="/images/badges/top1-dark.webp"
                  alt="Top 1 Product Badge (Dark Theme)"
                  className="hidden w-[200px] dark:block"
                />
              </div>
            </div>

            {/* Right Section: Columnar Navigation Links - 2 colonnes sur mobile, 6 sur md */}
            <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-6">
              {/* Discover Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  Discover
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {discoverLinks.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors duration-150"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Categories Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  <span className="sr-only">Hytale Servers by Category</span>
                  By Category
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {topCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/categories?category=${category.id}`}
                        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
                      >
                        <CategoryIcon
                          categoryId={category.id}
                          categoryName={category.name}
                          size={16}
                        />
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/categories"
                      className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-150"
                    >
                      View All →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Countries Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  <span className="sr-only">Hytale Servers by Country</span>
                  By Country
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {topCountriesWithNames.map((country) => (
                    <li key={country.code}>
                      <Link
                        href={`/countries?country=${country.code}`}
                        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
                      >
                        <CircleFlag
                          countryCode={country.code.toLowerCase()}
                          height={16}
                          className="w-4 h-4"
                        />
                        {country.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/countries"
                      className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-150"
                    >
                      View All →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  Resources
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {resourcesLinks.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors duration-150"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  Legal
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors duration-150"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect Column */}
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase font-heading">
                  Connect
                </h3>
                <ul className="mt-4 flex flex-col items-start space-y-3">
                  {connectLinkItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
