import { env } from "./env"

export const normalizeImageUrl = (value: string): string => {
	if (!value) return value

	let urlValue = value.trim()

	if (urlValue.startsWith("/")) {
		const base =
			env.NEXT_PUBLIC_API_URL ||
			(typeof window !== "undefined" ? window.location.origin : "")

		if (base) {
			try {
				urlValue = new URL(urlValue, base).toString()
			} catch {
				return urlValue
			}
		}
	}

	if (!urlValue.startsWith("http://") && !urlValue.startsWith("https://")) {
		return urlValue
	}

	try {
		const url = new URL(urlValue)

		if (url.hostname === "localhost") {
			url.hostname = "127.0.0.1"
		}

		return url.toString()
	} catch {
		return urlValue
	}
}

export const formatImageUrlForDisplay = (value: string): string => {
	if (!value) return value

	const urlValue = value.trim()

	if (!urlValue.startsWith("http://") && !urlValue.startsWith("https://")) {
		return urlValue
	}

	try {
		const url = new URL(urlValue)

		if (url.hostname === "127.0.0.1") {
			url.hostname = "localhost"
		}

		return url.toString()
	} catch {
		return urlValue
	}
}
