"use client"

import {
  RiGamepadLine,
  RiMegaphoneLine,
  RiRocketLine,
  RiSearchLine,
  RiThumbUpLine,
  RiTrophyLine,
} from "@remixicon/react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HowItWorksBanner() {
  return (
    <div className="mb-8">
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent>
          <Tabs defaultValue="owners" className="w-full">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-blue-900 dark:text-blue-100">
                  How HytaleHunt Works
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Discover how to make the most of our community.
                </p>
              </div>
              <TabsList className="grid w-full grid-cols-2 sm:w-[300px]">
                <TabsTrigger value="owners">For Server Owners</TabsTrigger>
                <TabsTrigger value="players">For Players</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="owners" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <RiRocketLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-blue-900 dark:text-blue-100">
                      1. Launch Server
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Submit your server and schedule a launch date to get maximum visibility.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <RiMegaphoneLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-blue-900 dark:text-blue-100">
                      2. Build Hype
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Share your launch page and encourage your community to upvote on launch day.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <RiTrophyLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-blue-900 dark:text-blue-100">
                      3. Win Badges
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Top 3 servers of the day earn exclusive badges and permanent exposure.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <RiSearchLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-indigo-900 dark:text-indigo-100">
                      1. Discover
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Browse daily launches and find the most promising Hytale servers.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <RiThumbUpLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-indigo-900 dark:text-indigo-100">
                      2. Support
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Upvote your favorite servers to help them reach the top of the leaderboard.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <RiGamepadLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-indigo-900 dark:text-indigo-100">
                      3. Play
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Get the IP address, join the community, and start your adventure.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
