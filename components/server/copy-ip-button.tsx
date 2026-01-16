"use client"

import { RiFileCopyLine } from "@remixicon/react"
import type { VariantProps } from "class-variance-authority"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Button, type buttonVariants } from "@/components/ui/button"

interface CopyIpButtonProps {
	className?: string
	ipAddress: string
	name: string
}

export function CopyIpButton({
	className,
	ipAddress,
	name,
	variant = "default",
	...props
}: CopyIpButtonProps &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	return (
		<Button
			variant={variant}
			size="sm"
			className={cn("h-9 px-3 cursor-copy", className)}
			onClick={(e) => {
				e.stopPropagation()
				e.preventDefault()
				navigator.clipboard.writeText(ipAddress)
				toast.success("IP copied to clipboard!")
			}}
			title={`Copy ${name} IP address`}
			{...props}
		>
			<RiFileCopyLine className="h-4 w-4" />
			<span>{ipAddress}</span>
		</Button>
	)
}
