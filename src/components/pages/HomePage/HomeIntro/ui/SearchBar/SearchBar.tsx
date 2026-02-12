"use client"

import { CharterFlightsSearchBar } from "@/components/forms/CharterFlightsSearchBar/CharterFlightsSearchBar"
import { navigateWithTransition } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useAllCharterFlights } from "@/hooks/useAllCharterFlights"
import { useAuth } from "@/hooks/useAuth"
import { saveCharterDraft } from "@/lib/charter-draft"
import type { CharterFlightsSearchInput } from "@/lib/validation"
import { useRouter } from "next/navigation"

const CALLBACK_URL = "/flights/continue"

export function SearchBar() {
	const router = useRouter()
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
	const { setIsTransitionComplete } = usePageTransition()
	const { flights, isLoading, error } = useAllCharterFlights({ enabled: true })

	const onValidSubmit = (values: CharterFlightsSearchInput) => {
		if (isAuthLoading) return

		const payload = {
			from: values.from,
			to: values.to,
			dateFrom: values.dateFrom,
			dateTo: values.dateTo,
			adults: values.adults,
			children: typeof values.children === "number" ? values.children : 0,
			categories: values.categories || [],
			hasSeats: values.hasSeats,
			hasBusinessClass: values.hasBusinessClass,
			hasComfortClass: values.hasComfortClass,
		}

		saveCharterDraft(payload)

		if (!isAuthenticated) {
			navigateWithTransition(
				router,
				`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`,
				setIsTransitionComplete,
			)

			return
		}

		navigateWithTransition(router, CALLBACK_URL, setIsTransitionComplete)
	}

	return (
		<CharterFlightsSearchBar
			flights={flights}
			flightsLoading={isLoading}
			flightsError={
				error
					? "Не удалось загрузить список рейсов. Попробуйте обновить страницу."
					: undefined
			}
			submitLabel="Забронировать"
			onSubmit={values => onValidSubmit(values)}
		/>
	)
}
