"use client"

import Image from "next/image"

import {
  RiGamepadLine,
  RiInformationLine,
  RiMegaphoneLine,
  RiRocketLine,
  RiSearchLine,
  RiThumbUpLine,
  RiTrophyLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HowItWorksModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-secondary sm:bg-transparent flex w-full items-center justify-center gap-1 text-sm sm:w-auto"
        >
          <RiInformationLine className="h-4 w-4" />
          How it works
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">
            How HytaleHunt Works
          </DialogTitle>
          <DialogDescription>
            Discover how to make the most of our community and help your favorite servers grow.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="owners" className="mt-4 w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owners">For Server Owners</TabsTrigger>
            <TabsTrigger value="players">For Players</TabsTrigger>
          </TabsList>

          <TabsContent value="owners" className="mt-6 space-y-8">
            <div className="grid gap-6">
              <Step
                icon={<RiRocketLine className="h-5 w-5" />}
                title="1. Launch Server"
                description="Submit your server and schedule a launch date to get maximum visibility on our daily leaderboard."
                color="blue"
              />
              <Step
                icon={<RiMegaphoneLine className="h-5 w-5" />}
                title="2. Build Hype"
                description="Share your launch page and encourage your community to upvote on launch day to climb the rankings."
                color="blue"
              />
              <Step
                icon={<RiTrophyLine className="h-5 w-5" />}
                title="3. Win Badges"
                description="Top 3 servers of the day earn exclusive badges and permanent exposure on our hall of fame."
                color="blue"
              />
            </div>

            <div className="bg-muted/50 rounded-xl p-6">
              <h4 className="mb-4 text-center text-sm font-semibold text-blue-900 dark:text-blue-100">
                Daily Winner Badges
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex flex-col items-center gap-2">
                    <div className="relative h-[40px] w-[160px]">
                      <Image
                        src={`/images/badges/top${rank}-light.webp`}
                        alt={`Top ${rank} Badge`}
                        fill
                        className="object-contain dark:hidden"
                      />
                      <Image
                        src={`/images/badges/top${rank}-dark.webp`}
                        alt={`Top ${rank} Badge`}
                        fill
                        className="hidden object-contain dark:block"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-blue-700 dark:text-blue-300">
                Winners can display these badges on their websites to show off their achievement.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="players" className="mt-6 space-y-6">
            <div className="grid gap-6">
              <Step
                icon={<RiSearchLine className="h-5 w-5" />}
                title="1. Discover"
                description="Browse daily launches and find the most promising Hytale servers before everyone else."
                color="indigo"
              />
              <Step
                icon={<RiThumbUpLine className="h-5 w-5" />}
                title="2. Support"
                description="Upvote your favorite servers to help them reach the top of the leaderboard and gain visibility."
                color="indigo"
              />
              <Step
                icon={<RiGamepadLine className="h-5 w-5" />}
                title="3. Play"
                description="Get the IP address, join the community, and start your adventure in the Hytale universe."
                color="indigo"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface StepProps {
  icon: React.ReactNode
  title: string
  description: string
  color: "blue" | "indigo"
}

function Step({ icon, title, description, color }: StepProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
  }

  return (
    <div className="flex gap-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
