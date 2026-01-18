"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { RiRocketLine, RiThumbUpLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function WelcomeBanner() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verifica se o banner já foi mostrado
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeBanner")

    if (!hasSeenWelcome) {
      // Pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("hasSeenWelcomeBanner", "true")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl sm:text-2xl font-bold">
            Welcome to HytaleHunt!
          </DialogTitle>
          <DialogDescription className="text-sm">
            The platform where Hytale servers gain visibility and players discover the best
            experiences.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-6">
          {/* Para donos de servidor */}
          <div className="bg-muted/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <RiRocketLine className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold text-foreground">
                  Are you a server owner?
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                  Submit your server and compete for the top of the daily ranking! Gain visibility
                  and attract more players to your community.
                </p>
                <Button asChild className="w-full sm:w-auto" size="sm">
                  <Link href="/servers/submit" onClick={handleClose}>
                    Submit Server
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Para jogadores */}
          <div className="bg-muted/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <RiThumbUpLine className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold text-foreground">
                  Are you a player?
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Explore servers, vote for your favorites, and help the community find the best
                  experiences. <strong>Voting will be available starting Monday! (01/19)</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
