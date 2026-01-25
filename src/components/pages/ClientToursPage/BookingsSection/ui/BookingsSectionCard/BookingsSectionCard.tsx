"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Booking } from "@/types"
import Link from "next/link"
import s from "./BookingsSectionCard.module.scss"

interface BookingsSectionCardProps {
	booking: Booking
}

export function BookingsSectionCard({ booking }: BookingsSectionCardProps) {
	const displayBookingId = booking.publicId ?? booking.id
	const displayTourId = booking.tourPublicId ?? booking.tourId
	const guestsCount = booking.participants?.length ?? 0

	const metaParts = [
		`Гостей: ${guestsCount}`,

		booking.createdAt ? `Создано: ${formatDate(booking.createdAt)}` : null,

		typeof booking.totalAmount === "number"
			? `Сумма: ${formatCurrency(booking.totalAmount)}`
			: null,
	].filter(Boolean)

	return (
		<Link
			href={`/client/tours/booking/${displayBookingId}`}
			className={s.bookingCard}
		>
			<div className={s.bookingInfo}>
				<p className={s.bookingId}>#{displayBookingId}</p>

				<h3 className={s.bookingTitle}>Тур {displayTourId}</h3>

				<p className={s.bookingMeta}>{metaParts.join(" · ")}</p>

				<div className={s.statusBadge} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
