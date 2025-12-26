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
	return (
		<Link href={`/manager/tours/booking/${booking.id}`} className={s.card}>
			<div className={s.cardInfo}>
				<p className={s.cardId}>#{booking.id}</p>

				<h3 className={s.cardTitle}>Тур {booking.tourId}</h3>

				<p className={s.cardMeta}>
					Гостей: {booking.partySize}
					{booking.startDate ? ` · Дата: ${formatDate(booking.startDate)}` : ""}
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
