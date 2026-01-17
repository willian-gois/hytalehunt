"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { RiCloseLine, RiRocketLine, RiThumbUpLine } from "@remixicon/react"

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">
            Welcome to HytaleHunt!
          </DialogTitle>
          <DialogDescription>
            The platform where Hytale servers gain visibility and players discover the best
            experiences.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Para donos de servidor */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <RiRocketLine className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
                  Are you a server owner?
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Submit your server and compete for the top of the daily ranking! Gain visibility
                  and attract more players to your community.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/servers/submit" onClick={handleClose}>
                    Submit Server
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Para jogadores */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <RiThumbUpLine className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
                  Are you a player?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Explore servers, vote for your favorites, and help the community find the best
                  experiences. <strong>Voting will be available starting Monday! (01/19)</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Botão de fechar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose} className="gap-2">
              <RiCloseLine className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
