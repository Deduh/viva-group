"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import {
	navigateWithTransition,
	TransitionLink,
} from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useAllCharterFlights } from "@/hooks/useAllCharterFlights"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { clearCharterDraft, loadCharterDraft } from "@/lib/charter-draft"
import { resolveCharterFlightForBooking } from "@/lib/charter-flight-resolve"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import s from "./page.module.scss"

const CALLBACK_URL = "/flights/continue"

export default function FlightsContinuePage() {
	const router = useRouter()
	const { isAuthenticated, isLoading, user } = useAuth()
	const { showError, showSuccess } = useToast()
	const { isTransitionComplete, setIsTransitionComplete } = usePageTransition()
	const [error, setError] = useState<Error | null>(null)
	const [pendingNav, setPendingNav] = useState<string | null>(null)
	const startedRef = useRef(false)
	const {
		flights,
		isLoading: flightsLoading,
		error: flightsError,
		refetch,
	} = useAllCharterFlights({ enabled: true })

	useEffect(() => {
		if (!pendingNav) return
		if (!isTransitionComplete) return

		navigateWithTransition(
			router,
			pendingNav,
			setIsTransitionComplete,
			"replace",
		)
		setPendingNav(null)
	}, [isTransitionComplete, pendingNav, router, setIsTransitionComplete])

	useEffect(() => {
		if (isLoading) return
		if (flightsLoading) return
		if (!isTransitionComplete) return

		if (!isAuthenticated) {
			router.replace(
				`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`,
			)

			return
		}

		if (user && user.role !== "CLIENT") {
			setError(
				prev =>
					prev ?? new Error("Создание заявок доступно только для клиентов"),
			)

			return
		}

		const draft = loadCharterDraft()
		if (!draft) {
			setError(
				prev =>
					prev ??
					new Error("Черновик заявки не найден. Заполните форму на главной."),
			)

			return
		}

		if (flightsError) {
			setError(
				prev =>
					prev ??
					new Error("Не удалось загрузить список рейсов. Попробуйте еще раз."),
			)

			return
		}

		const resolved = resolveCharterFlightForBooking(flights, {
			from: draft.from,
			to: draft.to,
			dateFrom: draft.dateFrom,
			dateTo: draft.dateTo,
		})

		if (!resolved.ok) {
			if (resolved.reason === "dates_not_supported") {
				setError(
					prev =>
						prev ?? new Error("Выбранные даты недоступны по расписанию рейса."),
				)

				return
			}

			setError(
				prev =>
					prev ??
					new Error("Не удалось подобрать рейс по выбранному направлению."),
			)

			return
		}

		if (startedRef.current) return

		startedRef.current = true

		api
			.createCharterBooking({
				flightId: resolved.flight.id,
				dateFrom: draft.dateFrom,
				dateTo: draft.dateTo,
				adults: draft.adults,
				children: typeof draft.children === "number" ? draft.children : 0,
			})
			.then(created => {
				const wishes: string[] = []

				if (draft.categories?.length) {
					wishes.push(`Категории: ${draft.categories.join(", ")}`)
				}

				const filters: string[] = []

				if (draft.hasSeats) filters.push("Есть места")
				if (draft.hasBusinessClass) filters.push("Бизнес-класс")
				if (draft.hasComfortClass) filters.push("Комфорт-класс")

				if (filters.length) {
					wishes.push(`Фильтры: ${filters.join(", ")}`)
				}

				if (wishes.length) {
					api
						.createCharterMessage(
							created.id,
							`Пожелания по авиабилету:\n${wishes
								.map(w => `- ${w}`)
								.join("\n")}`,
						)
						.catch(() => undefined)
				}

				clearCharterDraft()
				showSuccess("Заявка на авиабилет отправлена!")
				setPendingNav(`/client/flights/booking/${created.publicId}`)
			})
			.catch(err => {
				const message =
					err instanceof Error ? err.message : "Не удалось создать заявку"

				setError(
					prev => prev ?? (err instanceof Error ? err : new Error(message)),
				)
				showError(message)

				if (message.includes("Этот рейс больше недоступен")) {
					refetch().catch(() => undefined)
				}
			})
	}, [
		flights,
		flightsError,
		flightsLoading,
		isAuthenticated,
		isLoading,
		isTransitionComplete,
		refetch,
		router,
		setIsTransitionComplete,
		showError,
		showSuccess,
		user,
	])

	if (isLoading) {
		return (
			<div className={s.container}>
				<LoadingSpinner fullScreen text="Проверка аккаунта..." />
			</div>
		)
	}

	if (flightsLoading) {
		return (
			<div className={s.container}>
				<LoadingSpinner fullScreen text="Загрузка рейсов..." />
			</div>
		)
	}

	if (error) {
		return (
			<div className={s.container}>
				<div className={s.background} aria-hidden="true">
					<span className={s.orb} />
					<span className={s.orbSecondary} />
					<span className={s.grid} />
				</div>

				<div className={s.content}>
					<div className={s.icon}>✈️</div>

					<h1 className={s.title}>Не удалось продолжить</h1>

					<p className={s.message}>{error.message}</p>

					<div className={s.actions}>
						<TransitionLink href="/" className={s.backButton}>
							← На главную
						</TransitionLink>

						<TransitionLink
							href="/client/flights"
							className={s.dashboardButton}
						>
							Мои авиабилеты
						</TransitionLink>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={s.container}>
			<LoadingSpinner fullScreen text="Создаем заявку..." />
		</div>
	)
}
