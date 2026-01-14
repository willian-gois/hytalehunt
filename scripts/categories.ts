import { db } from "@/drizzle/db"
import { category } from "@/drizzle/db/schema"

const SERVER_CATEGORIES = [
  { id: "anarchy", name: "Anarchy" },
  { id: "creative", name: "Creative" },
  { id: "egg-wars", name: "Egg Wars" },
  { id: "economy", name: "Economy" },
  { id: "factions", name: "Factions" },
  { id: "hardcore", name: "Hardcore" },
  { id: "kit-pvp", name: "Kit PvP" },
  { id: "mcmmo", name: "MCMMO" },
  { id: "mini-games", name: "Mini Games" },
  { id: "mmo", name: "MMO" },
  { id: "pixelmon", name: "Pixelmon" },
  { id: "pve", name: "PvE" },
  { id: "pvp", name: "PvP" },
  { id: "parkour", name: "Parkour" },
  { id: "prison", name: "Prison" },
  { id: "roleplay", name: "Roleplay" },
  { id: "sky-wars", name: "Sky Wars" },
  { id: "skyblock", name: "Skyblock" },
  { id: "survival", name: "Survival" },
  { id: "towny", name: "Towny" },
  { id: "vanilla", name: "Vanilla" },
]

const initializeCategories = async () => {
  const data = await db
  const categories = await data.query.category.findMany()
  if (categories.length === 0) {
    await data.insert(category).values(SERVER_CATEGORIES)
  }
}

try {
  initializeCategories().then(() => {
    console.log("✅ Categories initialized successfully!")
  })
} catch (error) {
  console.error("❌ Error initializing categories:", error)
}
