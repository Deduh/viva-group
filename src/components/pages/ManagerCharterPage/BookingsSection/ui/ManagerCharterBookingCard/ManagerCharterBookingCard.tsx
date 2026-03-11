"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import {
	CHARTER_TRIP_TYPE_LABEL,
	normalizeCharterTripType,
} from "@/lib/charter-trip-type"
import { formatDate } from "@/lib/format"
import type { CharterBooking } from "@/types"
import Link from "next/link"
import s from "./ManagerCharterBookingCard.module.scss"

interface ManagerCharterBookingCardProps {
	booking: CharterBooking
}

export function ManagerCharterBookingCard({
	booking,
}: ManagerCharterBookingCardProps) {
	const displayBookingId = booking.publicId ?? booking.id
	const from = booking.flight?.from || booking.from || "Не указано"
	const to = booking.flight?.to || booking.to || "Не указано"
	const tripType = normalizeCharterTripType(booking.tripType)
	const route = `${from} - ${to}`
	const passengerCount = booking.adults + booking.children
	const clientName = booking.user?.name || booking.user?.email || ""
	const created = booking.createdAt ? formatDate(booking.createdAt) : ""

	return (
		<Link
			href={`/manager/flights/booking/${displayBookingId}`}
			className={s.card}
		>
			<div className={s.cardInfo}>
				<p className={s.cardId}>#{displayBookingId}</p>

				<h3 className={s.cardTitle}>Рейс {route}</h3>

				<p className={s.cardMeta}>
					Пассажиров: {passengerCount}
					{clientName ? ` · Клиент: ${clientName}` : ""}
					{created ? ` · Создано: ${created}` : ""}
				</p>

				<p className={s.cardMeta}>
					Тип: {CHARTER_TRIP_TYPE_LABEL[tripType]} · Вылет:{" "}
					{formatDate(booking.dateFrom)} ·{" "}
					{tripType === "ONE_WAY" || !booking.dateTo
						? "Обратный рейс: не нужен"
						: `Возврат: ${formatDate(booking.dateTo)}`}
					{booking.flight?.publicId ? ` · ${booking.flight.publicId}` : ""}
				</p>

				<div className={s.status} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
