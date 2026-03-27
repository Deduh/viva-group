import type { Role, Tour } from "@/types"

export function getPublicTourHref(tour: Pick<Tour, "id" | "publicId">) {
	return `/tours/${tour.publicId ?? tour.id}`
}

export function getTourHotelsPreview(tour: Pick<Tour, "hasHotelOptions" | "hotels">) {
	if (!tour.hasHotelOptions || !tour.hotels?.length) return []

	return tour.hotels.slice(0, 3).map(hotel => `${hotel.name} ${hotel.stars}*`)
}

export function getTourAudiencePrice(
	tour: Pick<Tour, "price" | "agentPrice">,
	role?: Role | null,
) {
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
	tour: Pick<Tour, "price" | "agentPrice" | "hotels">,
	role: Role | null | undefined,
	participants:
		| number
		| Array<{
				selectedHotelId?: string
		  }>,
) {
	const basePrice = getTourAudiencePrice(tour, role)

	if (typeof participants === "number") {
		return basePrice * Math.max(1, participants)
	}

	return participants.reduce(
		(sum, participant) =>
			sum + basePrice + getSelectedHotelSupplement(tour, participant.selectedHotelId, role),
		0,
	)
}
