import { stripeClient } from "@better-auth/stripe/client"
import { adminClient, oneTapClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { env } from "@/env"

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  getSession,
  updateUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  oneTap,
  admin,
} = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    env.NODE_ENV !== "development" ? "https://www.hytalehunt.com" : "http://localhost:3000",
  ],
  plugins: [
    stripeClient({
      subscription: true, //if you want to enable subscription management
    }),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    adminClient(),
  ],
})
