ALTER TABLE "server" RENAME COLUMN "github_url" TO "discord_url";--> statement-breakpoint
ALTER TABLE "server" RENAME COLUMN "tech_stack" TO "mods";--> statement-breakpoint
ALTER TABLE "server" DROP COLUMN "pricing";--> statement-breakpoint
ALTER TABLE "server" DROP COLUMN "platforms";