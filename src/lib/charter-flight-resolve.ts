import type { CharterFlight } from "@/types"

export type CharterBookingWishInput = {
	from: string
	to: string
	dateFrom: string // YYYY-MM-DD
	dateTo: string // YYYY-MM-DD
}

const toDateOnly = (iso: string) => iso.slice(0, 10)

const isoWeekday = (date: Date) => {
	// JS: 0..6 (Sun..Sat). API: 1..7 (Mon..Sun).
	return ((date.getUTCDay() + 6) % 7) + 1
}

const inRange = (dateOnly: string, startIso: string, endIso: string) => {
	const start = toDateOnly(startIso)
	const end = toDateOnly(endIso)
	return dateOnly >= start && dateOnly <= end
}

const matchesSchedule = (flight: CharterFlight, dateOnly: string) => {
	const date = new Date(dateOnly)
	if (Number.isNaN(date.getTime())) return false

	return flight.weekDays.includes(isoWeekday(date))
}

export type ResolveCharterFlightResult =
	| { ok: true; flight: CharterFlight }
	| {
			ok: false
			reason:
				| "no_flights"
				| "route_not_found"
				| "dates_not_supported"
				| "invalid_date"
	  }

export function resolveCharterFlightForBooking(
	flights: CharterFlight[],
	input: CharterBookingWishInput,
): ResolveCharterFlightResult {
	if (!Array.isArray(flights) || flights.length === 0) {
		return { ok: false, reason: "no_flights" }
	}

	const from = input.from.trim()
	const to = input.to.trim()

	const routeFlights = flights.filter(f => f.from === from && f.to === to)
	if (routeFlights.length === 0) {
		return { ok: false, reason: "route_not_found" }
	}

	const df = input.dateFrom
	const dt = input.dateTo

	const dfTime = new Date(df).getTime()
	const dtTime = new Date(dt).getTime()
	if (Number.isNaN(dfTime) || Number.isNaN(dtTime)) {
		return { ok: false, reason: "invalid_date" }
	}

	const matching = routeFlights.find(flight => {
		if (!inRange(df, flight.dateFrom, flight.dateTo)) return false
		if (!inRange(dt, flight.dateFrom, flight.dateTo)) return false

		if (!matchesSchedule(flight, df)) return false
		if (!matchesSchedule(flight, dt)) return false

		return true
	})

	if (!matching) {
		return { ok: false, reason: "dates_not_supported" }
	}

	return { ok: true, flight: matching }
}
