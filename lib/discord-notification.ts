/**
 * Utility for sending notifications to Discord via webhook
 */

import { eq } from "drizzle-orm"

import { env } from "@/env"

import { db } from "@/drizzle/db"
import { launchType as LaunchTypeEnum, server, user } from "@/drizzle/db/schema"

interface DiscordEmbed {
  title: string
  color: number
  description: string
  url?: string
  fields: {
    name: string
    value: string
    inline: boolean
  }[]
  footer: {
    text: string
  }
  timestamp: string
}

interface DiscordMessage {
  embeds: DiscordEmbed[]
}

/**
 * Send a Discord notification for a new comment
 * @param serverId ID of the server where the comment was posted
 * @param userId ID of the user who posted the comment
 * @param commentText Text of the comment
 */
export async function sendDiscordCommentNotification(
  serverId: string,
  userId: string,
  commentText: string,
): Promise<boolean> {
  try {
    const webhookUrl = env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not defined in environment variables")
      return false
    }

    // Retrieve user information
    let userInfo = { email: userId, name: "Unknown User" }
    try {
      const userResult = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      if (userResult.length > 0) {
        userInfo = userResult[0]
      }
    } catch (error) {
      console.error("Error retrieving user information:", error)
    }

    // Retrieve server information
    let serverInfo = { slug: serverId, name: "Unknown Server" }
    try {
      const serverResult = await db
        .select({ slug: server.slug, name: server.name })
        .from(server)
        .where(eq(server.id, serverId))
        .limit(1)

      if (serverResult.length > 0) {
        serverInfo = serverResult[0]
      }
    } catch (error) {
      console.error("Error retrieving server information:", error)
    }

    // Build server URL
    const serverUrl = `${env.NEXT_PUBLIC_URL}/servers/${serverInfo.slug}`

    // Truncate comment text if it's too long
    const truncatedText =
      commentText.length > 1500 ? commentText.substring(0, 1500) + "..." : commentText

    // Create message to send to Discord
    const message: DiscordMessage = {
      embeds: [
        {
          title: "New Comment",
          color: 0x00ff00, // Green for HytaleHunt
          description: truncatedText,
          url: serverUrl,
          fields: [
            {
              name: "Server",
              value: `[${serverInfo.name}](${serverUrl})`,
              inline: true,
            },
            {
              name: "User",
              value: `${userInfo.name} (${userInfo.email})`,
              inline: true,
            },
          ],
          footer: {
            text: "HytaleHunt Comment Notification",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Send request to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error(`Error sending to Discord: ${response.status} ${response.statusText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}

/**
 * Send a Discord notification for a scheduled launch
 * @param serverName Name of the server being launched
 * @param launchDate Date of the launch
 * @param launchType Type of launch (free, premium, premium plus)
 * @param websiteUrl URL of the server website
 * @param serverUrl URL of the server page on HytaleHunt
 * @param userId ID of the user who submitted the launch notification
 */
export async function notifyDiscordLaunch(
  serverName: string,
  launchDate: string,
  launchType: string,
  websiteUrl: string,
  serverUrl: string,
  userId?: string,
): Promise<boolean> {
  try {
    const webhookUrl = env.DISCORD_LAUNCH_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("Discord webhook URL is not defined")
      return false
    }

    // Format the launch type for display
    const formattedLaunchType = launchType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Determine color based on launch type, en utilisant les valeurs de l'enum
    let color = 0x00ff00 // Vert par défaut pour Free (LaunchTypeEnum.FREE)
    if (launchType === LaunchTypeEnum.PREMIUM) {
      // comparaison directe avec la valeur de l'enum
      color = 0xff9900 // Orange pour premium
    } else if (launchType === LaunchTypeEnum.PREMIUM_PLUS) {
      // comparaison directe
      color = 0xff0000 // Rouge pour premium plus
    }

    // Récupérer les informations de l'utilisateur si userId est fourni
    const submittedByFieldValue = await (async () => {
      if (!userId) return "N/A (User ID not provided)"
      try {
        const userResult = await db
          .select({ email: user.email, name: user.name })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1)

        if (userResult.length > 0 && userResult[0].name && userResult[0].email) {
          return `${userResult[0].name} (${userResult[0].email})`
        } else {
          console.warn(`[DiscordNotify] User info not found for ID: ${userId}`)
          return `User ID: ${userId} (Info not fully available)`
        }
      } catch (error) {
        console.error("[DiscordNotify] Error retrieving user info:", error)
        return `User ID: ${userId} (Error fetching info)`
      }
    })()

    const submittedByField = {
      name: "Submitted By",
      value: submittedByFieldValue,
      inline: true,
    }

    // Create message to send to Discord
    const message = {
      embeds: [
        {
          title: "New Server Launch Scheduled",
          color: color,
          url: serverUrl,
          description: `New server submitted: ${serverName}`,
          fields: [
            {
              name: "Server URL",
              value: `[Visit Server](${serverUrl})`,
              inline: true,
            },
            {
              name: "Launch Date",
              value: launchDate,
              inline: true,
            },
            {
              name: "Launch Type",
              value: formattedLaunchType,
              inline: true,
            },
            {
              name: "Website URL",
              value: `[Visit Website](${websiteUrl})`,
              inline: true,
            },
            submittedByField,
          ],
          footer: {
            text: "HytaleHunt Launch Notification",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Send request to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error(`Error sending to Discord: ${response.status} ${response.statusText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}
