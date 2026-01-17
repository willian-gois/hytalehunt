"use server"

import { env } from "@/env"

interface PostHogQueryResponse {
  results: Array<Array<number>>
  columns?: string[]
  types?: string[]
}

export async function getLast24hVisitors(): Promise<number | null> {
  const POSTHOG_PERSONAL_API_KEY = env.POSTHOG_PERSONAL_API_KEY
  const POSTHOG_PROJECT_ID = env.POSTHOG_PROJECT_ID
  const POSTHOG_HOST = env.POSTHOG_HOST || "https://app.posthog.com"

  if (!POSTHOG_PERSONAL_API_KEY) {
    console.error("PostHog API key (POSTHOG_PERSONAL_API_KEY) is not configured.")
    return null
  }
  if (!POSTHOG_PROJECT_ID) {
    console.error(
      "PostHog Project ID (POSTHOG_PROJECT_ID) for server-side API calls is not configured.",
    )
    return null
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query:
            "SELECT count(DISTINCT person_id) as visitors FROM events WHERE timestamp >= now() - INTERVAL 24 HOUR",
        },
      }),
      next: { revalidate: 600 }, // 10 min cache
    })

    if (!response.ok) {
      console.error(
        `Error fetching PostHog stats: ${response.status} ${response.statusText}`,
        await response.text(),
      )
      return null
    }

    const data = (await response.json()) as PostHogQueryResponse

    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0][0] != null) {
      return data.results[0][0]
    }

    console.error(
      "Unexpected PostHog API response structure or empty results:",
      JSON.stringify(data, null, 2),
    )
    return null
  } catch (error) {
    console.error("Error connecting to PostHog API:", error)
    return null
  }
}

export async function getLast7DaysVisitors(): Promise<number | null> {
  const POSTHOG_PERSONAL_API_KEY = env.POSTHOG_PERSONAL_API_KEY
  const POSTHOG_PROJECT_ID = env.POSTHOG_PROJECT_ID
  const POSTHOG_HOST = env.POSTHOG_HOST || "https://app.posthog.com"

  if (!POSTHOG_PERSONAL_API_KEY) {
    console.error("PostHog API key (POSTHOG_PERSONAL_API_KEY) is not configured.")
    return null
  }
  if (!POSTHOG_PROJECT_ID) {
    console.error(
      "PostHog Project ID (POSTHOG_PROJECT_ID) for server-side API calls is not configured.",
    )
    return null
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query:
            "SELECT count(DISTINCT person_id) as visitors FROM events WHERE timestamp >= now() - INTERVAL 7 DAY",
        },
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(
        `Error fetching PostHog stats (7 days): ${response.status} ${response.statusText}`,
        await response.text(),
      )
      return null
    }

    const data = (await response.json()) as PostHogQueryResponse

    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0][0] != null) {
      return data.results[0][0]
    }

    console.error(
      "Unexpected PostHog API response structure for 7-day query:",
      JSON.stringify(data, null, 2),
    )
    return null
  } catch (error) {
    console.error("Error connecting to PostHog API (7 days):", error)
    return null
  }
}

export async function getLast30DaysVisitors(): Promise<number | null> {
  const POSTHOG_PERSONAL_API_KEY = env.POSTHOG_PERSONAL_API_KEY
  const POSTHOG_PROJECT_ID = env.POSTHOG_PROJECT_ID
  const POSTHOG_HOST = env.POSTHOG_HOST || "https://app.posthog.com"

  if (!POSTHOG_PERSONAL_API_KEY) {
    console.error("PostHog API key (POSTHOG_PERSONAL_API_KEY) is not configured.")
    return null
  }
  if (!POSTHOG_PROJECT_ID) {
    console.error(
      "PostHog Project ID (POSTHOG_PROJECT_ID) for server-side API calls is not configured.",
    )
    return null
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query:
            "SELECT count(DISTINCT person_id) as visitors FROM events WHERE timestamp >= now() - INTERVAL 30 DAY",
        },
      }),
      next: { revalidate: 21600 }, // Cache for 6 hours
    })

    if (!response.ok) {
      console.error(
        `Error fetching PostHog stats (30 days): ${response.status} ${response.statusText}`,
        await response.text(),
      )
      return null
    }

    const data = (await response.json()) as PostHogQueryResponse

    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0][0] != null) {
      return data.results[0][0]
    }

    console.error(
      "Unexpected PostHog API response structure for 30-day query:",
      JSON.stringify(data, null, 2),
    )
    return null
  } catch (error) {
    console.error("Error connecting to PostHog API (30 days):", error)
    return null
  }
}

export async function getLast30DaysPageviews(): Promise<number | null> {
  const POSTHOG_PERSONAL_API_KEY = env.POSTHOG_PERSONAL_API_KEY
  const POSTHOG_PROJECT_ID = env.POSTHOG_PROJECT_ID
  const POSTHOG_HOST = env.POSTHOG_HOST || "https://app.posthog.com"

  if (!POSTHOG_PERSONAL_API_KEY) {
    console.error("PostHog API key (POSTHOG_PERSONAL_API_KEY) is not configured.")
    return null
  }
  if (!POSTHOG_PROJECT_ID) {
    console.error(
      "PostHog Project ID (POSTHOG_PROJECT_ID) for server-side API calls is not configured.",
    )
    return null
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query:
            "SELECT count() as pageviews FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY",
        },
      }),
      next: { revalidate: 21600 }, // Cache for 6 hours
    })

    if (!response.ok) {
      console.error(
        `Error fetching PostHog pageviews stats (30 days): ${response.status} ${response.statusText}`,
        await response.text(),
      )
      return null
    }

    const data = (await response.json()) as PostHogQueryResponse

    if (Array.isArray(data.results) && data.results.length > 0 && data.results[0][0] != null) {
      return data.results[0][0]
    }

    console.error(
      "Unexpected PostHog API response structure for 30-day pageviews query:",
      JSON.stringify(data, null, 2),
    )
    return null
  } catch (error) {
    console.error("Error connecting to PostHog API (30 days pageviews):", error)
    return null
  }
}
