"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useBookings } from "@/hooks/useBookings"
import s from "./TourChat.module.scss"

interface TourChatProps {
	tourId: string
}

export function TourChat({ tourId }: TourChatProps) {
	const { user } = useAuth()
	const { userBookings, isLoading } = useBookings({ showToasts: false })

	// Находим бронирование клиента для этого тура
	const userBooking = userBookings.find(booking => booking.tourId === tourId)

	if (!user) {
		return (
			<div className={s.container}>
				<div className={s.empty}>
					<p>Войдите в аккаунт, чтобы общаться с менеджером</p>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className={s.container}>
				<div className={s.loading}>
					<LoadingSpinner text="Поиск бронирования..." />
				</div>
			</div>
		)
	}

	if (!userBooking) {
		return (
			<div className={s.container}>
				<div className={s.empty}>
					<p>У вас нет активного бронирования на этот тур</p>
					<p className={s.emptyHint}>
						Забронируйте тур, чтобы начать общение с менеджером
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className={s.container}>
			<BookingChat bookingId={userBooking.id} />
		</div>
	)
}
