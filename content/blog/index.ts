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
    image: "/blog/complete-guide-how-create-hytale-server-2026/banner.webp",
    publishedAt: new Date("2026-01-18"),
  },
  {
    slug: "how-install-hytale-mods-client-server",
    filename: "how-install-hytale-mods-client-server.mdx",
    title: "How to Install Hytale Mods (Client & Server)",
    description:
      "Learn how to install Hytale mods for both single-player and multiplayer servers. Step-by-step guide covering client installation, server setup, automatic synchronization, and troubleshooting common issues.",
    tags: ["hytale", "mods", "tutorial", "client", "server", "modding"],
    metaTitle: "How to Install Hytale Mods - Client & Server Guide 2026",
    metaDescription:
      "Complete guide to installing Hytale mods on client and server. Includes automatic mod synchronization, CurseForge integration, troubleshooting, and best practices for modded servers.",
    image: "/blog/how-install-hytale-mods-client-server/banner.webp",
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
