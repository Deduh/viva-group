import type { Tour } from "@/types"

export function getPublicTourHref(tour: Pick<Tour, "id" | "publicId">) {
	return `/tours/${tour.publicId ?? tour.id}`
}

export function getTourHotelsPreview(tour: Pick<Tour, "hasHotelOptions" | "hotels">) {
	if (!tour.hasHotelOptions || !tour.hotels?.length) return []

	return tour.hotels.slice(0, 3).map(hotel => `${hotel.name} ${hotel.stars}*`)
}
