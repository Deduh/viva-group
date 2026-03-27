"use client"

import { BookingDetail } from "@/components/bookings/BookingDetail/BookingDetail"
import { OrderDetailView } from "@/components/bookings/OrderDetailView"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useBookingOrder } from "@/hooks/useBookingOrders"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ClientBookingDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const bookingId = params.id as string
	const isOrderRoute = bookingId.startsWith("VIVA-ORDER")

	const bookingQuery = useQuery({
		queryKey: ["bookings", bookingId],
		queryFn: () => api.getBooking(bookingId),
		enabled: !!bookingId && !isOrderRoute,
	})
	const orderQuery = useBookingOrder(bookingId, !!bookingId && isOrderRoute)

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

	useEffect(() => {
		if (bookingQuery.data && user && bookingQuery.data.userId !== user.id) {
			router.push("/client/tours")
		}
	}, [bookingQuery.data, user, router])

	useEffect(() => {
		if (orderQuery.data && user && orderQuery.data.userId !== user.id) {
			router.push("/client/tours")
		}
	}, [orderQuery.data, user, router])

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

	if (bookingQuery.isLoading || orderQuery.isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка деталей..." />
			</div>
		)
	}

	if (bookingQuery.error || orderQuery.error) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Ошибка загрузки"
					message="Не удалось загрузить информацию по туру."
					error={(bookingQuery.error || orderQuery.error) as Error}
				/>
			</div>
		)
	}

	if (isOrderRoute && orderQuery.data) {
		return (
			<div className={s.shell}>
				<OrderDetailView
					order={orderQuery.data}
					backHref="/client/tours"
					backLabel="Назад к заказам"
					bookingHrefBuilder={id => `/client/tours/booking/${id}`}
				/>
			</div>
		)
	}

	if (!bookingQuery.data) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Запись не найдена"
					message="Не удалось найти бронирование или заказ с указанным ID."
				/>
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<BookingDetail booking={bookingQuery.data} />
		</div>
	)
}
