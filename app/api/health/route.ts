import { NextResponse } from "next/server"

import { sql } from "drizzle-orm"

import { db } from "@/drizzle/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`)

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
