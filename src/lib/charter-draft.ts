import type { CharterTripType } from "@/types"

export type CharterDraft = {
	tripType: CharterTripType
	from: string
	to: string
	dateFrom: string // YYYY-MM-DD
	dateTo?: string // YYYY-MM-DD (для ROUND_TRIP)
	adults: number
	children: number
	categories: string[]
	hasSeats: boolean
	hasBusinessClass: boolean
	hasComfortClass: boolean
}

const STORAGE_KEY = "charterDraft:v1"
const MAX_AGE_MS = 1000 * 60 * 60 * 2 // 2 hours

type StoredDraft = {
	data: CharterDraft
	createdAt: number
}

export function saveCharterDraft(data: CharterDraft) {
	if (typeof window === "undefined") return

	const payload: StoredDraft = { data, createdAt: Date.now() }
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadCharterDraft(): CharterDraft | null {
	if (typeof window === "undefined") return null

	const raw = window.sessionStorage.getItem(STORAGE_KEY)
	if (!raw) return null

	try {
		const parsed = JSON.parse(raw) as Partial<StoredDraft>
		if (!parsed || typeof parsed !== "object") return null
		if (typeof parsed.createdAt !== "number") return null
		if (!parsed.data) return null

		if (Date.now() - parsed.createdAt > MAX_AGE_MS) {
			clearCharterDraft()
			return null
		}

		const data = parsed.data as Partial<CharterDraft>

		if (
			typeof data.from !== "string" ||
			typeof data.to !== "string" ||
			typeof data.dateFrom !== "string" ||
			typeof data.adults !== "number"
		) {
			return null
		}

		const tripType: CharterTripType =
			data.tripType === "ONE_WAY" ? "ONE_WAY" : "ROUND_TRIP"

		return {
			tripType,
			from: data.from,
			to: data.to,
			dateFrom: data.dateFrom,
			dateTo:
				tripType === "ROUND_TRIP" && typeof data.dateTo === "string"
					? data.dateTo
					: undefined,
			adults: data.adults,
			children: typeof data.children === "number" ? data.children : 0,
			categories: Array.isArray(data.categories) ? data.categories : [],
			hasSeats: Boolean(data.hasSeats),
			hasBusinessClass: Boolean(data.hasBusinessClass),
			hasComfortClass: Boolean(data.hasComfortClass),
		}
	} catch {
		return null
	}
}

export function clearCharterDraft() {
	if (typeof window === "undefined") return
	window.sessionStorage.removeItem(STORAGE_KEY)
}
