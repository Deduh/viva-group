"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { CharterBooking } from "@/types"
import Link from "next/link"
import s from "./BookingsSectionCard.module.scss"

interface BookingsSectionCardProps {
	booking: CharterBooking
}

export function BookingsSectionCard({ booking }: BookingsSectionCardProps) {
	const displayBookingId = booking.publicId ?? booking.id
	const from = booking.flight?.from || booking.from || "Не указано"
	const to = booking.flight?.to || booking.to || "Не указано"

	const metaParts = [
		`Даты: ${formatDate(booking.dateFrom)} - ${formatDate(booking.dateTo)}`,

		`Пассажиров: ${booking.adults} взр${booking.children ? `, ${booking.children} дет` : ""}`,
	].filter(Boolean)

	return (
		<Link
			href={`/client/flights/booking/${displayBookingId}`}
			className={s.bookingCard}
		>
			<div className={s.bookingInfo}>
				<p className={s.bookingId}>#{displayBookingId}</p>

				<h3 className={s.bookingTitle}>
					{from} → {to}
				</h3>

				<p className={s.bookingMeta}>{metaParts.join(" · ")}</p>

				<div className={s.statusBadge} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
