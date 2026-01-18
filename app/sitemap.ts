import type { MetadataRoute } from "next"

import { eq, or } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { blogArticle, category, server } from "@/drizzle/db/schema"
import { env } from "@/env"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_URL

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/winners`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sponsors`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Get all published servers (only ongoing and launched)
  const servers = await db
    .select({
      slug: server.slug,
      updatedAt: server.updatedAt,
    })
    .from(server)
    .where(or(eq(server.launchStatus, "ongoing"), eq(server.launchStatus, "launched")))

  const serverRoutes: MetadataRoute.Sitemap = servers.map((srv) => ({
    url: `${baseUrl}/servers/${srv.slug}`,
    lastModified: srv.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Get all blog articles
  const articles = await db
    .select({
      slug: blogArticle.slug,
      updatedAt: blogArticle.updatedAt,
    })
    .from(blogArticle)

  const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  // Get all categories
  const categories = await db
    .select({
      id: category.id,
    })
    .from(category)

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories?category=${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }))

  // Static countries page
  const countriesStaticRoute: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/countries`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // Get all countries with servers
  const countries = await db
    .selectDistinct({ country: server.country })
    .from(server)
    .where(or(eq(server.launchStatus, "ongoing"), eq(server.launchStatus, "launched")))

  const countryRoutes: MetadataRoute.Sitemap = countries
    .filter((c): c is { country: string } => c.country !== null && c.country !== "")
    .map((country) => ({
      url: `${baseUrl}/countries?country=${country.country}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }))

  return [
    ...staticRoutes,
    ...serverRoutes,
    ...blogRoutes,
    ...categoryRoutes,
    ...countriesStaticRoute,
    ...countryRoutes,
  ]
}
