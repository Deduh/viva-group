"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import type { GroupTransportBooking } from "@/types/group-transport"

export function useGroupTransportBookings() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["groupTransportBookings"],
		queryFn: api.getGroupTransportBookings,
	})

	const bookings: GroupTransportBooking[] = data?.items || []

	return {
		bookings,
		isLoading,
		error,
		refetch,
	}
}
