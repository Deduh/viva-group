"use client"

import { CharterFlightsSearchBar } from "@/components/forms/CharterFlightsSearchBar/CharterFlightsSearchBar"
import { useAllCharterFlights } from "@/hooks/useAllCharterFlights"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { resolveCharterFlightForBooking } from "@/lib/charter-flight-resolve"
import type { CharterFlightsSearchInput } from "@/lib/validation"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import s from "./FlightsSection.module.scss"

export function FlightsSection() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { showError, showSuccess } = useToast()

	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		flights,
		isLoading: flightsLoading,
		error: flightsError,
		refetch,
	} = useAllCharterFlights({ enabled: true })

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

	const handleSubmit = async (values: CharterFlightsSearchInput) => {
		if (flightsLoading) return
		if (!flights || flights.length === 0) {
			showError("Список рейсов пока недоступен. Попробуйте позже.")

			return
		}

		const resolved = resolveCharterFlightForBooking(flights, {
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
			dateFrom: values.dateFrom,
			dateTo: values.dateTo,
			adults: values.adults,
			children: typeof values.children === "number" ? values.children : 0,
		}

		setIsSubmitting(true)

		try {
			const created = await api.createCharterBooking(payload)

			const wishesText = buildWishesText(values)

			if (wishesText) {
				api.createCharterMessage(created.id, wishesText).catch(() => undefined)
			}

			void queryClient.invalidateQueries({ queryKey: ["charterBookings"] })

			showSuccess("Заявка на авиабилет создана")
			router.push(`/client/flights/booking/${created.publicId}`)
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

	return (
		<section className={s.section}>
			<h2 className={s.title}>Забронировать авиабилет</h2>

			<div className={s.formWrap}>
				<CharterFlightsSearchBar
					flights={flights}
					flightsLoading={flightsLoading}
					flightsError={
						flightsError
							? "Не удалось загрузить список рейсов. Попробуйте обновить страницу."
							: undefined
					}
					submitLabel="Забронировать"
					submitDisabled={isSubmitting}
					onSubmit={handleSubmit}
				/>
			</div>
		</section>
	)
}
