"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { GroupTransportBooking } from "@/types/group-transport"
import Link from "next/link"
import s from "./BookingsSectionCard.module.scss"

type Props = {
	booking: GroupTransportBooking
}

export function BookingsSectionCard({ booking }: Props) {
	const forward = booking.segments.find(seg => seg.direction === "forward")
	const returnSeg = booking.segments.find(seg => seg.direction === "return")

	return (
		<Link
			href={`/client/group-transport/booking/${booking.id}`}
			className={s.bookingCard}
		>
			<div className={s.bookingInfo}>
				<p className={s.bookingId}>#{booking.id}</p>
				<h3 className={s.bookingTitle}>
					{forward ? `${forward.from} → ${forward.to}` : "Маршрут"}
				</h3>
				<p className={s.bookingMeta}>
					{forward?.departureDate
						? `Туда: ${formatDate(forward.departureDate)}`
						: "Дата уточняется"}
					{returnSeg?.departureDate
						? ` · Обратно: ${formatDate(returnSeg.departureDate)}`
						: ""}
					{booking.createdAt
						? ` · Создано: ${formatDate(booking.createdAt)}`
						: ""}
				</p>
				<div className={s.statusBadge} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
