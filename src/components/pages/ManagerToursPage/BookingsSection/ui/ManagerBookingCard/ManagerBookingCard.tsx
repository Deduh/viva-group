"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { Booking } from "@/types"
import Link from "next/link"
import s from "./ManagerBookingCard.module.scss"

interface ManagerBookingCardProps {
	booking: Booking
}

export function ManagerBookingCard({ booking }: ManagerBookingCardProps) {
	const displayBookingId = booking.publicId ?? booking.id
	const displayTourId = booking.tourPublicId ?? booking.tourId
	const guestsCount = booking.participants?.length ?? 0

	return (
		<Link
			href={`/manager/tours/booking/${displayBookingId}`}
			className={s.card}
		>
			<div className={s.cardInfo}>
				<p className={s.cardId}>#{displayBookingId}</p>

				<h3 className={s.cardTitle}>Тур {displayTourId}</h3>

				<p className={s.cardMeta}>
					Гостей: {guestsCount}
					{booking.createdAt
						? ` · Создано: ${formatDate(booking.createdAt)}`
						: ""}
				</p>

				<div className={s.status} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
