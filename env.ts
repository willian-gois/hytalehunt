import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().url(),

    // Authentication
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),

    // Google OAuth
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // Cloudflare Turnstile
    TURNSTILE_SECRET_KEY: z.string().min(1),

    // Discord Notifications
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_LAUNCH_WEBHOOK_URL: z.string().url().optional(),

    // Email (Resend)
    RESEND_API_KEY: z.string().min(1),

    // Cron Jobs
    CRON_API_KEY: z.string().min(1),

    // UploadThing
    UPLOADTHING_TOKEN: z.string().min(1),

    // Plausible Analytics
    PLAUSIBLE_API_KEY: z.string().min(1).optional(),
    PLAUSIBLE_URL: z.string().url().optional(),
    PLAUSIBLE_SITE_ID: z.string().min(1).optional(),

    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Application
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),

    // Google OAuth
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),

    // Stripe
    NEXT_PUBLIC_PREMIUM_PAYMENT_LINK: z.string().url(),
    NEXT_PUBLIC_PREMIUM_PLUS_PAYMENT_LINK: z.string().url(),

    // Cloudflare Turnstile
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),

    // UploadThing
    NEXT_PUBLIC_UPLOADTHING_URL: z.string().min(1),

    // SEO
    NEXT_PUBLIC_SEO_ARTICLE_LINK: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    DISCORD_LAUNCH_WEBHOOK_URL: process.env.DISCORD_LAUNCH_WEBHOOK_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CRON_API_KEY: process.env.CRON_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    PLAUSIBLE_API_KEY: process.env.PLAUSIBLE_API_KEY,
    PLAUSIBLE_URL: process.env.PLAUSIBLE_URL,
    PLAUSIBLE_SITE_ID: process.env.PLAUSIBLE_SITE_ID,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_PREMIUM_PAYMENT_LINK: process.env.NEXT_PUBLIC_PREMIUM_PAYMENT_LINK,
    NEXT_PUBLIC_PREMIUM_PLUS_PAYMENT_LINK: process.env.NEXT_PUBLIC_PREMIUM_PLUS_PAYMENT_LINK,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_UPLOADTHING_URL: process.env.NEXT_PUBLIC_UPLOADTHING_URL,
    NEXT_PUBLIC_SEO_ARTICLE_LINK: process.env.NEXT_PUBLIC_SEO_ARTICLE_LINK,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
