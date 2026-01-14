import type { ComponentProps } from "react"

import { SPONSORSHIP_SLOTS } from "@/lib/constants"
import { SponsorCard } from "@/components/home/sponsor-card"

// TODO: Replace with dynamic data when sponsorship integration is ready.
const FEATURED_SPONSORS: Array<ComponentProps<typeof SponsorCard>> = []

export function SponsorCards() {
  const slotsAvailable = Math.max(SPONSORSHIP_SLOTS.TOTAL - SPONSORSHIP_SLOTS.USED, 0)

  const slotMessage =
    slotsAvailable > 0
      ? `${slotsAvailable} slot${slotsAvailable === 1 ? " is" : "s are"} available.`
      : "All slots are currently filled."

  const minimumCards = 3
  const displayCards = [...FEATURED_SPONSORS]
  const placeholdersNeeded = Math.max(minimumCards - displayCards.length, 0)

  if (placeholdersNeeded > 0) {
    const placeholderCard: ComponentProps<typeof SponsorCard> = {
      className: "border-dashed border-primary/40",
      variant: "announce",
      description: `Promote your brand to thousands of Hytale fans. ${slotMessage}`,
      url: "/sponsors",
    }

    displayCards.push(...Array.from({ length: placeholdersNeeded }, () => placeholderCard))
  }

  return (
    <div className="space-y-2">
      {displayCards.map((sponsor, index) => (
        <SponsorCard key={sponsor.url ?? sponsor.name ?? `placeholder-${index}`} {...sponsor} />
      ))}
    </div>
  )
}
