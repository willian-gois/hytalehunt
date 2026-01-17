import { env } from "node:process"

import { sendEmail } from "@/lib/email"

interface BasicUser {
  email: string
  name: string | null
}

const APP_URL = env.NEXT_PUBLIC_APP_URL || "https://hytalehunt.com"

function getBadgeName(ranking: number): string {
  switch (ranking) {
    case 1:
      return `Top 1 Winner`
    case 2:
      return `Top 2 Winner`
    case 3:
      return `Top 3 Winner`
    default:
      return `Winner`
  }
}

export async function sendWinnerBadgeEmail({
  serverName,
  serverSlug,
  ranking,
  user,
  launchType,
}: {
  user: BasicUser
  ranking: number
  serverName: string
  serverSlug: string
  launchType: string | null
}) {
  const badgeName = getBadgeName(ranking)
  const effectiveUserName = user.name || "Winner"
  const effectiveUserEmail = user.email
  const isPremium = launchType === "premium" || launchType === "premium_plus"

  const serverBadgesPageUrl = `${APP_URL}/servers/${serverSlug}/badges`

  const subject = `🏆 ${serverName} is a Top ${ranking} Winner!`

  // Message différent selon le type de lancement
  const doFollowMessage = isPremium
    ? `<p><strong>🎉 Dofollow Backlink:</strong> Congrats! You automatically earned a dofollow backlink as a premium winner.</p>`
    : `<p><strong>🔗 Dofollow Backlink:</strong> Add your badge to your website and <a href="mailto:contact@hytalehunt.com?subject=Dofollow Request - ${serverName}&body=Hi, I placed the badge on my website. Here's the URL: [YOUR_WEBSITE_URL]">email us your site URL</a> to activate your dofollow link!</p>`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; color: #1a1a1a;">Hi ${effectiveUserName} 👋</h1>
      <p><strong>${serverName}</strong> is a <strong>${badgeName}</strong> on HytaleHunt!</p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="${serverBadgesPageUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
          🏆 Get Your Badge
        </a>
      </p>
      
      ${doFollowMessage}

      <p style="margin-top: 25px;">Congrats! 🎉<br>Eric</p>
    </div>
  `

  return sendEmail({
    to: effectiveUserEmail,
    subject,
    html: htmlBody,
  })
}

export async function sendLaunchReminderEmail({
  serverName,
  serverSlug,
  user,
}: {
  user: BasicUser
  serverName: string
  serverSlug: string
}) {
  const effectiveUserName = user.name || "Creator"
  const effectiveUserEmail = user.email

  const subject = `🚀 ${serverName} is Live on HytaleHunt!`
  const serverUrl = `${APP_URL}/servers/${serverSlug}`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 22px; color: #1a1a1a;">Hi ${effectiveUserName},</h1>
      <p>Just a quick heads-up: your server, <strong>${serverName}</strong>, is launching today on HytaleHunt!</p>
      <p>We hope you had a great launch day!</p>
      <p>You can view your server live here: <a href="${serverUrl}">${serverUrl}</a></p> 
      <p style="margin-top: 25px;">Best of luck!</p>
      <p>The HytaleHunt Team</p>
    </div>
  `

  return sendEmail({
    to: effectiveUserEmail,
    subject,
    html: htmlBody,
  })
}
