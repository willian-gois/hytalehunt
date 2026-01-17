import { defineConfig } from "drizzle-kit"

import "dotenv/config"

import { env } from "./env"

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./drizzle/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
