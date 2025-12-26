"use client"

import { formatDate } from "@/lib/format"
import type { Booking } from "@/types"
import Link from "next/link"
import s from "./BookingsSectionCard.module.scss"

interface BookingsSectionCardProps {
	booking: Booking
}

export function BookingsSectionCard({ booking }: BookingsSectionCardProps) {
	return (
		<Link
			href={`/client/tours/booking/${booking.id}`}
			className={s.bookingCard}
		>
			<div className={s.bookingInfo}>
				<p className={s.bookingId}>#{booking.id}</p>
				<h3 className={s.bookingTitle}>Тур {booking.tourId}</h3>
				<p className={s.bookingMeta}>
					Гостей: {booking.partySize}
					{booking.startDate ? ` · Дата: ${formatDate(booking.startDate)}` : ""}
					{booking.createdAt
						? ` · Создано: ${formatDate(booking.createdAt)}`
						: ""}
				</p>
				<div className={s.statusBadge} data-status={booking.status}>
					{booking.status === "PENDING" && "Ожидает подтверждения"}
					{booking.status === "CONFIRMED" && "Подтверждено"}
					{booking.status === "CANCELLED" && "Отменено"}
					{booking.status === "IN_PROGRESS" && "В процессе"}
					{booking.status === "COMPLETED" && "Завершено"}
				</div>
			</div>
		</Link>
	)
}
