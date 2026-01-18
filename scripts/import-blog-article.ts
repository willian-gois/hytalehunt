import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { ArticleConfig } from "@/content/blog"
import { articlesConfig } from "@/content/blog"
import { db } from "@/drizzle/db"
import { blogArticle } from "@/drizzle/db/schema"

async function importArticle(config: ArticleConfig) {
  try {
    const contentPath = join(process.cwd(), "content", "blog", config.filename)

    // Read the MDX/MD content
    console.log(`📖 Reading file: ${config.filename}`)
    const content = readFileSync(contentPath, "utf-8")

    // Check if article already exists
    const existingArticle = await db.query.blogArticle.findFirst({
      where: (article, { eq }) => eq(article.slug, config.slug),
    })

    if (existingArticle) {
      console.log("⚠️  Article already exists in database. Skipping import.")
      console.log(`   Slug: ${config.slug}`)
      console.log(`   Title: ${existingArticle.title}`)
      return
    }

    // Insert the article
    await db.insert(blogArticle).values({
      id: `${config.slug}-${Date.now()}`,
      slug: config.slug,
      title: config.title,
      description: config.description,
      content,
      tags: config.tags,
      author: config.author || "HytaleHunt Team",
      metaTitle: config.metaTitle || config.title,
      metaDescription: config.metaDescription || config.description,
      image: config.image || null,
      publishedAt: config.publishedAt,
    })

    console.log("✅ Blog article imported successfully!")
    console.log(`   Slug: ${config.slug}`)
    console.log(`   Title: ${config.title}`)
    console.log(`   Published: ${config.publishedAt.toISOString()}`)
    console.log(`   Tags: ${config.tags.join(", ")}`)
  } catch (error) {
    console.error(`❌ Error importing article "${config.filename}":`, error)
    throw error
  }
}

async function importAllArticles() {
  console.log(`\n📚 Found ${articlesConfig.length} articles in config\n`)

  for (const config of articlesConfig) {
    await importArticle(config)
    console.log("")
  }
}

async function importSpecificArticle(slug: string) {
  const config = articlesConfig.find((article) => article.slug === slug)

  if (!config) {
    console.error(`❌ Article with slug "${slug}" not found in config`)
    console.log("\nAvailable articles:")
    for (const article of articlesConfig) {
      console.log(`  - ${article.slug}`)
    }
    process.exit(1)
  }

  await importArticle(config)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    // No arguments: import all articles from config
    console.log("🚀 Importing all articles from content/blog/index.ts\n")
    await importAllArticles()
  } else {
    // Import specific article by slug
    const slug = args[0]
    console.log(`🚀 Importing article: ${slug}\n`)
    await importSpecificArticle(slug)
  }
}

main()
  .then(() => {
    console.log("\n🎉 Import completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Import failed:", error)
    process.exit(1)
  })
