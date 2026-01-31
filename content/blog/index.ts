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
  {
    slug: "how-to-create-hytale-mod-pack-item-tutorial",
    filename: "how-to-create-hytale-mod-pack-item-tutorial.mdx",
    title: "Hytale Modding Guide: How to Create Your First Custom Item & Pack",
    description:
      "Learn step-by-step how to create your first Hytale mod. Discover how to use the Asset Editor, add custom textures, and configure new items in the game.",
    tags: ["hytale", "modding", "asset editor", "custom textures", "tutorial"],
    metaTitle: "How to Create a Hytale Mod Pack - Hytale Item Tutorial 2026",
    metaDescription:
      "Learn step-by-step how to create your first Hytale mod. Discover how to use the Asset Editor, add custom textures, and configure new items in the game.",
    image: "/blog/how-to-create-hytale-mod-pack-item-tutorial/banner.webp",
    publishedAt: new Date("2026-01-31"),
  },
  {
    slug: "how-to-create-custom-blocks-recipes-hytale",
    filename: "how-to-create-custom-blocks-recipes-hytale.mdx",
    title: "Hytale Modding Guide: How to Create Custom Blocks & Smelting Recipes",
    description:
      "Level up your Hytale modding skills! Learn how to turn items into placeable blocks, configure loot tables (drops), and set up smelting recipes for new ingots.",
    tags: [
      "hytale",
      "modding",
      "asset editor",
      "custom blocks",
      "smelting recipes",
      "loot tables",
      "tutorial",
    ],
    metaTitle: "How to Create Custom Blocks & Smelting Recipes - Hytale Modding Guide 2026",
    metaDescription:
      "Level up your Hytale modding skills! Learn how to turn items into placeable blocks, configure loot tables (drops), and set up smelting recipes for new ingots.",
    image: "/blog/how-to-create-custom-blocks-recipes-hytale/banner.webp",
    publishedAt: new Date("2026-01-31"),
  },
  {
    slug: "how-to-create-custom-inventory-categories-hytale",
    filename: "how-to-create-custom-inventory-categories-hytale.mdx",
    title: "Hytale Modding Guide: How to Create Custom Inventory Categories & Tabs",
    description:
      "Keep your mod organized! Learn how to create custom categories (tabs) in Hytale's creative inventory, set up active icons, and sort your items and blocks.",
    tags: [
      "hytale",
      "modding",
      "asset editor",
      "custom inventory",
      "custom ui",
      "inventory tabs",
      "tutorial",
    ],
    metaTitle: "How to Create Custom Inventory Categories & Tabs - Hytale Modding Guide 2026",
    metaDescription:
      "Keep your mod organized! Learn how to create custom categories (tabs) in Hytale's creative inventory, set up active icons, and sort your items and blocks.",
    image: "/blog/how-to-create-custom-inventory-categories-hytale/banner.webp",
    publishedAt: new Date("2026-01-31"),
  },
  {
    slug: "how-to-create-advanced-custom-crafting-recipes-hytale",
    filename: "how-to-create-advanced-custom-crafting-recipes-hytale.mdx",
    title: "Hytale Modding Guide: How to Create Advanced Custom Crafting Recipes",
    description:
      "Break the limits of Hytale modding! Learn how to create standalone crafting recipes, fix Asset Editor crashes, and add your items to the Workbench or Arcanebench.",
    tags: [
      "hytale",
      "modding",
      "asset editor",
      "custom recipes",
      "crafting",
      "workbench",
      "json editing",
      "tutorial",
    ],
    metaTitle: "How to Create Advanced Custom Crafting Recipes - Hytale Modding Guide 2026",
    metaDescription:
      "Break the limits of Hytale modding! Learn how to create standalone crafting recipes, fix Asset Editor crashes, and add your items to the Workbench or Arcanebench.",
    image: "/blog/how-to-create-advanced-custom-crafting-recipes-hytale/banner.webp",
    publishedAt: new Date("2026-01-31"),
  },
  {
    slug: "how-to-overwrite-vanilla-assets-npcs-hytale",
    filename: "how-to-overwrite-vanilla-assets-npcs-hytale.mdx",
    title: "Hytale Modding Guide: How to Overwrite Vanilla Assets & NPCs",
    description:
      "Unlock the full power of Hytale modding! Learn how to overwrite any vanilla item, change default crafting recipes, and swap NPC models (like turning a deer into a penguin).",
    tags: [
      "hytale",
      "modding",
      "asset editor",
      "vanilla assets",
      "overwrite assets",
      "custom npcs",
      "tutorial",
    ],
    metaTitle: "How to Overwrite Vanilla Assets & NPCs - Hytale Modding Guide 2026",
    metaDescription:
      "Unlock the full power of Hytale modding! Learn how to overwrite any vanilla item, change default crafting recipes, and swap NPC models (like turning a deer into a penguin).",
    image: "/blog/how-to-overwrite-vanilla-assets-npcs-hytale/banner.webp",
    publishedAt: new Date("2026-01-31"),
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
