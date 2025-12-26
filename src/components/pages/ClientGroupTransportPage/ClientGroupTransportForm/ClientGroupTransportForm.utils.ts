import type {
	PassengerCountersInput,
	PassengerCounters,
	GroupTransportSegment,
	GroupTransportSegmentInput as Segment,
} from "@/types/group-transport"

export type { Segment }

export type FormValues = {
	segments: Segment[]
	note: string
}

export const defaultPassengers: PassengerCountersInput = {
	seniorsEco: undefined,
	adultsEco: undefined,
	youthEco: undefined,
	childrenEco: undefined,
	infantsEco: undefined,
	seniorsBusiness: undefined,
	adultsBusiness: undefined,
	youthBusiness: undefined,
	childrenBusiness: undefined,
	infantsBusiness: undefined,
}

export function createSegment(
	direction: Segment["direction"] = "forward"
): Segment {
	return {
		direction,
		departureDate: "",
		flightNumber: "",
		from: "",
		to: "",
		passengers: { ...defaultPassengers },
	}
}

export function normalizePassengers(
	passengers?: PassengerCountersInput
): PassengerCounters {
	return {
		seniorsEco: passengers?.seniorsEco ?? 0,
		adultsEco: passengers?.adultsEco ?? 0,
		youthEco: passengers?.youthEco ?? 0,
		childrenEco: passengers?.childrenEco ?? 0,
		infantsEco: passengers?.infantsEco ?? 0,
		seniorsBusiness: passengers?.seniorsBusiness ?? 0,
		adultsBusiness: passengers?.adultsBusiness ?? 0,
		youthBusiness: passengers?.youthBusiness ?? 0,
		childrenBusiness: passengers?.childrenBusiness ?? 0,
		infantsBusiness: passengers?.infantsBusiness ?? 0,
	}
}

export function normalizeSegment(segment: Segment): GroupTransportSegment {
	return {
		direction: segment.direction,
		departureDate: segment.departureDate,
		flightNumber: segment.flightNumber,
		from: segment.from,
		to: segment.to,
		passengers: normalizePassengers(segment.passengers),
	}
}
