"use client"

import { api } from "@/lib/api"
import type { CharterFlight, CharterFlightsFilters } from "@/types"
import { useQuery } from "@tanstack/react-query"

export function useCharterFlightsAdmin(
	filters: CharterFlightsFilters = {},
	options?: { enabled?: boolean },
) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["charterFlightsAdmin", filters],
		queryFn: () => api.getCharterFlightsAdmin(filters),
		enabled: options?.enabled ?? true,
	})

	const flights: CharterFlight[] = data?.items || []

	return {
		flights,
		isLoading,
		error,
		refetch,
	}
}
