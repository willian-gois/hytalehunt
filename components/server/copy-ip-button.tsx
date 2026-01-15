"use client"

import { RiFileCopyLine } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface CopyIpButtonProps {
  ipAddress: string
  name: string
}

export function CopyIpButton({ ipAddress, name }: CopyIpButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-3"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        navigator.clipboard.writeText(ipAddress)
        toast.success("IP copied to clipboard!")
      }}
      title={`Copy ${name} IP address`}
    >
      <RiFileCopyLine className="h-4 w-4" />
      <span>{ipAddress}</span>
    </Button>
  )
}
