import { env } from "@/lib/env/server"

export const getSiteUrl = () => {
	const base =
		env.NEXTAUTH_URL ||
		env.APP_URL ||
		process.env.NEXT_PUBLIC_SITE_URL ||
		"http://localhost:3001"

	return base.replace(/\/$/, "")
}

export const buildTitle = (title: string) => {
	return `${title} — Viva Group`
}
