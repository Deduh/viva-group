export type CharterDraft = {
	from: string
	to: string
	dateFrom: string // YYYY-MM-DD
	dateTo: string // YYYY-MM-DD
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

		return parsed.data as CharterDraft
	} catch {
		return null
	}
}

export function clearCharterDraft() {
	if (typeof window === "undefined") return
	window.sessionStorage.removeItem(STORAGE_KEY)
}
