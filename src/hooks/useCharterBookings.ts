"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import type { CharterBooking, CharterBookingsFilters } from "@/types"

export function useCharterBookings(filters: CharterBookingsFilters = {}) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["charterBookings", filters],
		queryFn: () => api.getCharterBookings(filters),
	})

	const bookings: CharterBooking[] = data?.items || []

	return {
		bookings,
		isLoading,
		error,
		refetch,
	}
}
