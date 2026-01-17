import { headers } from "next/headers" // Importer headers pour auth

import { createUploadthing, type FileRouter, UTFiles } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import type { FileUploadData } from "uploadthing/types"

import { auth } from "@/lib/auth" // Importer l'authentification

const f = createUploadthing()

const authenticateUser = async ({
	req,
	files,
}: {
	req: Request
	files: readonly FileUploadData[]
}) => {
	// Authenticate
	const session = await auth.api.getSession({ headers: await headers() })
	const user = session?.user

	if (!user?.id) throw new UploadThingError("Unauthorized")

	// Rename file
	const searchParams = new URLSearchParams(req.url)
	const slug = searchParams.get("slug")

	const prefix = slug === "serverBanner" ? "banner" : "logo"

	const fileOverrides = files.map((file) => {
		const fileExtension = file.name.split(".").pop()

		return { ...file, name: `${prefix}-${user.id}-${Date.now()}.${fileExtension}` }
	})

	return { userId: user.id, [UTFiles]: fileOverrides }
}

export const ourFileRouter = {
	serverLogo: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
		.middleware(authenticateUser)
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Logo Upload complete for userId:", metadata.userId)
			console.log("file url", file.ufsUrl)
			return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl }
		}),

	serverBanner: f({
		image: { maxFileSize: "2MB", maxFileCount: 1 },
		video: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(authenticateUser)
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Banner Upload complete for userId:", metadata.userId)
			console.log("file url", file.ufsUrl)
			return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
