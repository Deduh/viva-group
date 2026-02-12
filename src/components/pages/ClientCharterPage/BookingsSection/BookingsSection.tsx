"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import type { CharterBooking } from "@/types"
import s from "./BookingsSection.module.scss"
import { BookingsSectionCard } from "./ui/BookingsSectionCard/BookingsSectionCard"

interface BookingsSectionProps {
	bookings: CharterBooking[]
	isLoading: boolean
}

export function BookingsSection({ bookings, isLoading }: BookingsSectionProps) {
	return (
		<section className={s.section}>
			<h2 className={s.title}>Мои авиабилеты</h2>

			{isLoading ? (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка бронирований..." />
				</div>
			) : bookings.length === 0 ? (
				<div className={s.empty}>
					<p className={s.emptyText}>У вас пока нет забронированных авиабилетов</p>
				</div>
			) : (
				<div className={s.bookingsList}>
					{bookings.map(booking => (
						<BookingsSectionCard key={booking.id} booking={booking} />
					))}
				</div>
			)}
		</section>
	)
}
