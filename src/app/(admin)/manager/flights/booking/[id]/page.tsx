"use client"

import { ManagerCharterBookingDetail } from "@/components/pages/ManagerCharterPage/BookingDetail/ManagerCharterBookingDetail"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ManagerCharterBookingDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const bookingIdOrPublicId = params.id as string

	const bookingQuery = useQuery({
		queryKey: ["charterBookings", bookingIdOrPublicId],
		queryFn: () => api.getCharterBooking(bookingIdOrPublicId),
		enabled: !!bookingIdOrPublicId,
	})

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/login")

			return
		}

		if (user && user.role !== "MANAGER" && user.role !== "ADMIN") {
			if (user.role === "CLIENT") {
				router.push("/client/flights")
			} else {
				router.push("/login")
			}
		}
	}, [isAuthLoading, user, router])

	if (isAuthLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
		return null
	}

	if (bookingQuery.isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка заявки..." />
			</div>
		)
	}

	if (bookingQuery.error) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Ошибка загрузки заявки"
					message="Не удалось загрузить информацию о заявке."
					error={bookingQuery.error as Error}
				/>
			</div>
		)
	}

	if (!bookingQuery.data) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Заявка не найдена"
					message="Заявки с указанным ID не существует."
				/>
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<ManagerCharterBookingDetail booking={bookingQuery.data} />
		</div>
	)
}
