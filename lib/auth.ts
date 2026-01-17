import { stripe } from "@better-auth/stripe"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, captcha, oneTap } from "better-auth/plugins"
import Stripe from "stripe"

import { sendEmail } from "@/lib/email"

import { db } from "@/drizzle/db"
import { env } from "@/env"

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
})

export const auth = betterAuth({
  appName: "HytaleHunt",
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.NEXT_PUBLIC_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const html = `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = `
        <p>Hello ${user.name},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `

      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html,
      })
    },
    expiresIn: 86400,
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
    }),
    captcha({
      provider: "cloudflare-turnstile", // or "google-recaptcha"
      secretKey: env.TURNSTILE_SECRET_KEY,
      endpoints: ["/sign-up/email", "/sign-in/email", "/forget-password"],
    }),
    oneTap({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    }),
    admin({}),
  ],
})
