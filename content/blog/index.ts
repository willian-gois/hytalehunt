// Index centralisé de tous les articles du blog

export interface ArticleConfig {
  slug: string
  filename: string
  title: string
  description: string
  tags: string[]
  author?: string
  metaTitle?: string
  metaDescription?: string
  image?: string
  publishedAt: Date
}

export const articlesConfig: ArticleConfig[] = [
  {
    slug: "complete-guide-how-create-hytale-server-2026",
    filename: "complete-guide-how-create-hytale-server-2026.mdx",
    title: "Complete guide: How to create a Hytale server",
    description:
      "Complete guide to creating and managing a Hytale server, from installation to advanced configuration and community building. Learn system requirements, network setup, performance optimization, and troubleshooting.",
    tags: ["hytale", "server", "tutorial", "guide", "hosting", "setup"],
    metaTitle: "Complete guide: How to create a Hytale server - Complete Setup Guide 2026",
    metaDescription:
      "Learn how to create and manage your own Hytale server with this comprehensive guide covering setup, configuration, optimization, and troubleshooting. Step-by-step instructions for Windows and Linux.",
    image: "https://cdn.hytale.com/5c4b5d1ff69b310012f2173e_server_ui_concept.jpg",
    publishedAt: new Date("2026-01-18"),
  },
]

export const articles = articlesConfig.map((config) => ({
  slug: config.slug,
  import: () => import(`./${config.filename}`),
})) as {
  slug: string
  import: () => Promise<unknown>
}[]

export type ArticleSlug = (typeof articles)[number]["slug"]
