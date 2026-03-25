"use client"

import { CharterFlightsSearchBar } from "@/components/forms/CharterFlightsSearchBar/CharterFlightsSearchBar"
import { useAllAgentCharterFlights } from "@/hooks/useAllAgentCharterFlights"
import { useAllCharterFlights } from "@/hooks/useAllCharterFlights"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { resolveCharterFlightForBooking } from "@/lib/charter-flight-resolve"
import type { CharterFlightsSearchInput } from "@/lib/validation"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CharterFlightResultCard } from "./ui/CharterFlightResultCard/CharterFlightResultCard"
import s from "./FlightsSection.module.scss"

interface FlightsSectionProps {
	mode?: "client" | "agent"
}

export function FlightsSection({ mode = "client" }: FlightsSectionProps) {
	const isAgentMode = mode === "agent"
	const router = useRouter()
	const queryClient = useQueryClient()
	const { showError, showSuccess } = useToast()

	const [isSubmitting, setIsSubmitting] = useState(false)

	const clientFlightsQuery = useAllCharterFlights({ enabled: !isAgentMode })
	const agentFlightsQuery = useAllAgentCharterFlights({ enabled: isAgentMode })

	const flights = isAgentMode
		? agentFlightsQuery.flights
		: clientFlightsQuery.flights
	const flightsLoading = isAgentMode
		? agentFlightsQuery.isLoading
		: clientFlightsQuery.isLoading
	const flightsError = isAgentMode
		? agentFlightsQuery.error
		: clientFlightsQuery.error
	const refetch = isAgentMode
		? agentFlightsQuery.refetch
		: clientFlightsQuery.refetch

	const buildWishesText = (values: CharterFlightsSearchInput) => {
		const wishes: string[] = []

		if (values.categories?.length) {
			wishes.push(`Категории: ${values.categories.join(", ")}`)
		}

		const filters: string[] = []

		if (values.hasSeats) filters.push("Есть места")
		if (values.hasBusinessClass) filters.push("Бизнес-класс")
		if (values.hasComfortClass) filters.push("Комфорт-класс")

		if (filters.length) {
			wishes.push(`Фильтры: ${filters.join(", ")}`)
		}

		if (wishes.length === 0) return null

		return `Пожелания по авиабилету:\n${wishes.map(w => `- ${w}`).join("\n")}`
	}

	const createBookingFromValues = async (values: CharterFlightsSearchInput) => {
		if (flightsLoading) return
		if (!flights || flights.length === 0) {
			showError("Список рейсов пока недоступен. Попробуйте позже.")

			return
		}

		const resolved = resolveCharterFlightForBooking(flights, {
			tripType: values.tripType,
			from: values.from,
			to: values.to,
			dateFrom: values.dateFrom,
			dateTo: values.dateTo,
		})

		if (!resolved.ok) {
			if (resolved.reason === "dates_not_supported") {
				showError("Выбранные даты недоступны по расписанию рейса.")

				return
			}

			showError("Не удалось подобрать рейс по выбранному направлению.")

			return
		}

		const payload = {
			flightId: resolved.flight.id,
			tripType: values.tripType,
			dateFrom: values.dateFrom,
			adults: values.adults,
			children: typeof values.children === "number" ? values.children : 0,
		} as const

		const createPayload =
			values.tripType === "ROUND_TRIP" && values.dateTo
				? { ...payload, dateTo: values.dateTo }
				: payload

		setIsSubmitting(true)

		try {
			const created = await api.createCharterBooking(createPayload)

			const wishesText = buildWishesText(values)

			if (wishesText) {
				api.createCharterMessage(created.id, wishesText).catch(() => undefined)
			}

			void queryClient.invalidateQueries({ queryKey: ["charterBookings"] })

			showSuccess("Заявка на авиабилет создана")
			router.push(
				isAgentMode
					? `/agent/flights/booking/${created.publicId}`
					: `/client/flights/booking/${created.publicId}`,
			)
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "Не удалось создать заявку"

			showError(message)

			if (message.includes("Этот рейс больше недоступен")) {
				await refetch()
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleQuickBook = (flight: (typeof flights)[number]) => {
		void createBookingFromValues({
			tripType: "ROUND_TRIP",
			from: flight.from,
			to: flight.to,
			dateFrom: flight.dateFrom.slice(0, 10),
			dateTo: flight.dateTo.slice(0, 10),
			adults: 1,
			children: 0,
			categories: [],
			hasSeats: true,
			hasBusinessClass: false,
			hasComfortClass: false,
		})
	}

	return (
		<section className={s.section}>
			<h2 className={s.title}>
				{isAgentMode ? "Чартеры для агентств" : "Забронировать авиабилет"}
			</h2>

			<div className={s.formWrap}>
				<CharterFlightsSearchBar
					flights={flights}
					flightsLoading={flightsLoading}
					flightsError={
						flightsError
							? "Не удалось загрузить список рейсов. Попробуйте обновить страницу."
							: undefined
					}
					submitLabel={isAgentMode ? "Оформить агентскую заявку" : "Забронировать"}
					submitDisabled={isSubmitting}
					onSubmit={values => createBookingFromValues(values)}
				/>
			</div>

			{isAgentMode && flights.length > 0 && (
				<div className={s.results}>
					<div className={s.resultsHeader}>
						<h3 className={s.resultsTitle}>Агентские тарифы</h3>
						<p className={s.resultsText}>
							На этом экране агент видит отдельную цену и свою комиссию по рейсу.
						</p>
					</div>

					<div className={s.resultsGrid}>
						{flights.slice(0, 6).map(flight => (
							<CharterFlightResultCard
								key={flight.id}
								flight={flight}
								showPricing
								onBook={() => handleQuickBook(flight)}
								isBooking={isSubmitting}
							/>
						))}
					</div>
				</div>
			)}
		</section>
	)
}
