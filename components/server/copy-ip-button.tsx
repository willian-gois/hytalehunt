"use client"

import { RiFileCopyLine } from "@remixicon/react"
import type { VariantProps } from "class-variance-authority"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/use-analytics"

import { Button, type buttonVariants } from "@/components/ui/button"

interface CopyIpButtonProps {
  className?: string
  ipAddress: string
  name: string
  serverId: string
}

export function CopyIpButton({
  className,
  ipAddress,
  name,
  serverId,
  variant = "default",
  size = "sm",
  ...props
}: CopyIpButtonProps &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const { track } = useAnalytics()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-9 cursor-copy", className)}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        navigator.clipboard.writeText(ipAddress)
        toast.success("IP address copied to clipboard!")
        if (track) {
          track("server_ip_copied", {
            server_id: serverId,
            ip_address: ipAddress,
          })
        }
      }}
      title={`Copy ${name} IP address`}
      {...props}
    >
      <RiFileCopyLine className="h-4 w-4" />
      {size === "icon" ? null : <span>{ipAddress}</span>}
    </Button>
  )
}
