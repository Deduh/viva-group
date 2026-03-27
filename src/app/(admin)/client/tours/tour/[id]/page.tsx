"use client"

import { TourInfo } from "@/components/pages/ClientToursPage/TourDetail"
import { TourBookingPanel } from "@/components/tours/TourBookingPanel/TourBookingPanel"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ClientTourDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const tourId = params.id as string
	const tourQueryKeyRole = user?.role === "AGENT" ? "agent" : "public"

	const tourQuery = useQuery({
		queryKey: ["tour", tourQueryKeyRole, tourId],
		queryFn: () =>
			user?.role === "AGENT" ? api.getAgentTour(tourId) : api.getTour(tourId),
		enabled: !!tourId,
	})

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/login")

			return
		}

		if (user && user.role !== "CLIENT" && user.role !== "AGENT") {
			if (user.role === "ADMIN") {
				router.push("/manager/tours")
			} else if (user.role === "MANAGER") {
				router.push("/manager/tours")
			}

			return
		}
	}, [isAuthLoading, user, router])

	if (isAuthLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user || (user.role !== "CLIENT" && user.role !== "AGENT")) {
		return null
	}

	if (tourQuery.isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка тура..." />
			</div>
		)
	}

	if (tourQuery.error) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Ошибка загрузки тура"
					message="Не удалось загрузить информацию о туре."
					error={tourQuery.error as Error}
				/>
			</div>
		)
	}

	if (!tourQuery.data) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Тур не найден"
					message="Тур с указанным ID не существует."
				/>
			</div>
		)
	}

	const tour = tourQuery.data

	return (
		<div className={s.shell}>
			<BackButton href="/client/tours" label="Назад к турам" />

			<div className={s.content}>
				<TourInfo tour={tour} />

				<div className={s.bookingSection}>
					<TourBookingPanel tour={tour} />
				</div>
			</div>
		</div>
	)
}
