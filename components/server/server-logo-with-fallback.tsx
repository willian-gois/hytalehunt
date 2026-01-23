"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

const FALLBACK_SRC = "/logo.webp"

export function ServerLogoWithFallback({
  logoUrl,
  name,
  width = 64,
  height = 64,
  className,
}: {
  logoUrl: string | null | undefined
  name: string
  width?: number
  height?: number
  className?: string
}) {
  const [src, setSrc] = useState(logoUrl ?? FALLBACK_SRC)

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      sizes="(max-width: 640px) 48px, 56px"
      onError={() => setSrc(FALLBACK_SRC)}
    />
  )
}
