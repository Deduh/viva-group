"use client"

import { GroupTransportBookingDetail } from "@/components/pages/ClientGroupTransportPage/BookingDetail/GroupTransportBookingDetail"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function GroupTransportBookingDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const bookingId = params.id as string

	const bookingQuery = useQuery({
		queryKey: ["groupTransportBookings", bookingId],
		queryFn: () => api.getGroupTransportBooking(bookingId),
		enabled: !!bookingId,
	})

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/login")

			return
		}

		if (user && user.role !== "CLIENT") {
			if (user.role === "ADMIN") {
				router.push("/manager/group-transport")
			} else if (user.role === "MANAGER") {
				router.push("/manager/group-transport")
			}

			return
		}
	}, [isAuthLoading, user, router])

	useEffect(() => {
		if (bookingQuery.data && user && bookingQuery.data.userId !== user.id) {
			router.push("/client/group-transport")
		}
	}, [bookingQuery.data, user, router])

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

	if (bookingQuery.isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка бронирования..." />
			</div>
		)
	}

	if (bookingQuery.error) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Ошибка загрузки бронирования"
					message="Не удалось загрузить информацию о бронировании."
					error={bookingQuery.error as Error}
				/>
			</div>
		)
	}

	if (!bookingQuery.data) {
		return (
			<div className={s.shell}>
				<ErrorMessage
					title="Бронирование не найдено"
					message="Бронирование с указанным ID не существует."
				/>
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<GroupTransportBookingDetail booking={bookingQuery.data} />
		</div>
	)
}
