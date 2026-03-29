import type { Role, Tour, TourDeparture } from "@/types"

export function getPublicTourHref(tour: Pick<Tour, "id" | "publicId">) {
	return `/tours/${tour.publicId ?? tour.id}`
}

export function getTourHotelsPreview(tour: Pick<Tour, "hasHotelOptions" | "hotels">) {
	if (!tour.hasHotelOptions || !tour.hotels?.length) return []

	return tour.hotels.slice(0, 3).map(hotel => `${hotel.name} ${hotel.stars}*`)
}

export function getTourAvailableDepartures(
	tour: Pick<Tour, "departures">,
): TourDeparture[] {
	return (tour.departures ?? []).filter(departure => departure.available !== false)
}

export function getTourPrimaryDeparture(
	tour: Pick<Tour, "departures">,
): TourDeparture | undefined {
	const availableDepartures = getTourAvailableDepartures(tour)

	return availableDepartures[0] ?? tour.departures?.[0]
}

export function getTourDisplayDateRange(
	tour: Pick<Tour, "departures" | "dateFrom" | "dateTo">,
) {
	const primaryDeparture = getTourPrimaryDeparture(tour)

	return {
		dateFrom: primaryDeparture?.dateFrom ?? tour.dateFrom,
		dateTo: primaryDeparture?.dateTo ?? tour.dateTo,
	}
}

export function getTourDepartureById(
	tour: Pick<Tour, "departures">,
	departureId?: string,
): TourDeparture | undefined {
	if (!departureId) return getTourPrimaryDeparture(tour)

	return tour.departures?.find(departure => departure.id === departureId)
}

export function tourHasDepartures(tour: Pick<Tour, "departures">) {
	return Array.isArray(tour.departures) && tour.departures.length > 0
}

export function getTourAudiencePrice(
	tour: Pick<Tour, "price" | "agentPrice" | "departures">,
	role?: Role | null,
	departureId?: string,
) {
	const departure =
		getTourDepartureById(tour, departureId) ??
		(tourHasDepartures(tour) ? getTourPrimaryDeparture(tour) : undefined)

	if (departure) {
		return role === "AGENT"
			? departure.agentPrice ?? departure.price
			: departure.price
	}

	return role === "AGENT" ? tour.agentPrice ?? tour.price : tour.price
}

export function getTourHotelAudienceSupplement(
	hotel: Pick<Tour["hotels"][number], "supplementPrice" | "agentSupplementPrice">,
	role?: Role | null,
) {
	return role === "AGENT"
		? hotel.agentSupplementPrice ?? hotel.supplementPrice
		: hotel.supplementPrice
}

export function getSelectedHotelSupplement(
	tour: Pick<Tour, "hotels">,
	selectedHotelId: string | undefined,
	role?: Role | null,
) {
	if (!selectedHotelId) return 0

	const hotel = tour.hotels.find(item => item.id === selectedHotelId)

	if (!hotel) return 0

	return getTourHotelAudienceSupplement(hotel, role)
}

export function calculateTourCartLineTotal(
	tour: Pick<Tour, "price" | "agentPrice" | "departures" | "hotels">,
	role: Role | null | undefined,
	participants:
		| number
		| Array<{
				selectedHotelId?: string
		  }>,
	departureId?: string,
) {
	const basePrice = getTourAudiencePrice(tour, role, departureId)

	if (typeof participants === "number") {
		return basePrice * Math.max(1, participants)
	}

	return participants.reduce(
		(sum, participant) =>
			sum +
			basePrice +
			getSelectedHotelSupplement(tour, participant.selectedHotelId, role),
		0,
	)
}
