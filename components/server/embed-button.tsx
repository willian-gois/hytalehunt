"use client"

import { useState } from "react"

import { RiCodeLine, RiFileCopyLine } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EmbedButtonProps {
  serverName: string
  serverSlug: string
  dailyRanking: number
}

export function EmbedButton({ serverName, serverSlug, dailyRanking }: EmbedButtonProps) {
  const [open, setOpen] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://hytalehunt.com"

  const embedCode = `<a href="${baseUrl}/servers/${serverSlug}" target="_blank" rel="noopener">
  <img
    src="${baseUrl}/images/badges/top${dailyRanking}-light.webp"
    alt="${serverName} - HytaleHunt Top ${dailyRanking} Daily Winner"
    width="195"
    height="48"
  />
</a>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success("Embed code copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RiCodeLine className="h-4 w-4" />
          Get Embed Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Badge Code</DialogTitle>
          <DialogDescription>
            Copy this code to display your achievement badge on your website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 max-h-64 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap break-all">
              <code className="text-foreground">{embedCode}</code>
            </pre>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCopy} className="flex items-center gap-2">
              <RiFileCopyLine className="h-4 w-4" />
              Copy Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
