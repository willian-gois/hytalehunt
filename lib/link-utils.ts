import { launchStatus as launchStatusEnum, server as serverSchema } from "@/drizzle/db/schema"

import { LAUNCH_TYPES } from "@/lib/constants"

type ServerSchemaSelect = typeof serverSchema.$inferSelect

interface ServerLinkInfo {
  launchType?: ServerSchemaSelect["launchType"]
  launchStatus?: ServerSchemaSelect["launchStatus"]
  dailyRanking?: ServerSchemaSelect["dailyRanking"]
}

export function getServerWebsiteRelAttribute(serverInfo: ServerLinkInfo): string {
  let rel = "noopener"

  const isPremiumTier =
    serverInfo.launchType === LAUNCH_TYPES.PREMIUM ||
    serverInfo.launchType === LAUNCH_TYPES.PREMIUM_PLUS

  const isTop3Daily =
    serverInfo.launchStatus === launchStatusEnum.LAUNCHED &&
    serverInfo.dailyRanking !== null &&
    typeof serverInfo.dailyRanking === "number" &&
    serverInfo.dailyRanking >= 1 &&
    serverInfo.dailyRanking <= 3

  if (!isPremiumTier && !isTop3Daily) {
    rel += " nofollow"
  }

  return rel
}
