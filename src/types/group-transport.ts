import type { BookingStatus } from "./enums"

export type PassengerCounters = {
	seniorsEco: number
	adultsEco: number
	youthEco: number
	childrenEco: number
	infantsEco: number
	seniorsBusiness: number
	adultsBusiness: number
	youthBusiness: number
	childrenBusiness: number
	infantsBusiness: number
}

export type PassengerCountersInput = Partial<PassengerCounters>

export type GroupTransportSegment = {
	direction: "forward" | "return"
	departureDate: string
	flightNumber: string
	from: string
	to: string
	passengers: PassengerCounters
}

export type GroupTransportSegmentInput = Omit<
	GroupTransportSegment,
	"passengers"
> & {
	passengers?: PassengerCountersInput
}

export type GroupTransportBooking = {
	id: string
	userId: string
	status: BookingStatus
	createdAt: string
	note?: string
	segments: GroupTransportSegment[]
}

export type CreateGroupTransportBookingInput = {
	note?: string
	segments: GroupTransportSegmentInput[]
}
