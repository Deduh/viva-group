"use client"

import { BookingForm } from "@/components/forms/BookingForm/BookingForm"
import {
	PriceCalculation,
	TourInfo,
} from "@/components/pages/ClientToursPage/TourDetail"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import s from "./page.module.scss"

export default function ClientTourDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const tourId = params.id as string
	const [partySize, setPartySize] = useState(1)

	const tourQuery = useQuery({
		queryKey: ["tours", tourId],
		queryFn: () => api.getTour(tourId),
		enabled: !!tourId,
	})

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/login")

			return
		}

		if (user && user.role !== "CLIENT") {
			if (user.role === "ADMIN") {
				router.push("/manager/tours")
			} else if (user.role === "MANAGER") {
				router.push("/manager/tours")
			}

			return
		}
	}, [isAuthLoading, user, router])

	const handleBookingSuccess = () => {
		router.push("/client/tours")
	}

	if (isAuthLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user || user.role !== "CLIENT") {
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
					<BookingForm
						tourId={tour.id}
						tourName={tour.destination}
						onSuccess={handleBookingSuccess}
						onPartySizeChange={setPartySize}
						isAvailable={tour.available}
					/>

					<PriceCalculation partySize={partySize} pricePerPerson={tour.price} />
				</div>
			</div>
		</div>
	)
}
