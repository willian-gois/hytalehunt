"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export type BannerType = "image" | "video"

interface ServerBannerWithLoaderProps {
  src: string
  alt: string
}

export function ServerBannerWithLoader({ src, alt }: ServerBannerWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState<BannerType | null>(null)

  // This is a workaround for the fact that we not know the media type here
  useEffect(() => {
    const video = document.createElement("video")

    const onLoaded = () => setType("video")
    const onError = () => setType("image")

    video.addEventListener("loadedmetadata", onLoaded)
    video.addEventListener("error", onError)

    video.src = src
    video.preload = "metadata"

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded)
      video.removeEventListener("error", onError)
    }
  }, [src])

  if (!type) return null

  return (
    <div className="relative overflow-hidden rounded-xl">
      {isLoading && <div className="bg-muted absolute inset-0 z-10 animate-pulse"></div>}
      {type === "video" ? (
        <video
          src={src}
          width={480}
          height={280}
          // className="rounded object-contain"
          className="h-auto w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        >
          <track kind="captions" />
        </video>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={480}
          height={280}
          // className="rounded object-contain"
          className="h-auto w-full object-cover"
          priority
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  )
}
