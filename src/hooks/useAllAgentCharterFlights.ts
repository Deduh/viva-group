"use client"

import { api } from "@/lib/api"
import type { CharterFlight } from "@/types"
import { useQuery } from "@tanstack/react-query"

const EMPTY_FLIGHTS: CharterFlight[] = []

export function useAllAgentCharterFlights(options?: { enabled?: boolean }) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["charterFlightsAll", "agent"],
		queryFn: () => api.getAllAgentCharterFlights(),
		enabled: options?.enabled ?? true,
	})

	const flights: CharterFlight[] = data || EMPTY_FLIGHTS

	return { flights, isLoading, error, refetch }
}
