import type { CharterTripType } from "@/types"

export const CHARTER_TRIP_TYPE_LABEL: Record<CharterTripType, string> = {
	ROUND_TRIP: "Туда-обратно",
	ONE_WAY: "В одну сторону",
}

export function normalizeCharterTripType(
	tripType?: CharterTripType | null,
): CharterTripType {
	return tripType === "ONE_WAY" ? "ONE_WAY" : "ROUND_TRIP"
}
