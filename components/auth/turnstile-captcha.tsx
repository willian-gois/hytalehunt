"use client"

import { useRef } from "react"

import { Turnstile } from "@marsidev/react-turnstile"

import { env } from "@/env"

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
}

export function TurnstileCaptcha({ onVerify }: TurnstileCaptchaProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef(null)

  if (!siteKey) {
    console.error("Turnstile site key is not defined")
    return null
  }

  if (env.NODE_ENV === "development") {
    onVerify("development")
    return null
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={() => console.error("Turnstile verification error")}
        onExpire={() => console.warn("Turnstile verification expired")}
        options={{
          size: "normal",
        }}
      />
    </div>
  )
}
