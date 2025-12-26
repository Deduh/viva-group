"use client"

import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { GroupTransportBooking } from "@/types/group-transport"
import Link from "next/link"
import s from "./ManagerGroupTransportBookingCard.module.scss"

interface ManagerGroupTransportBookingCardProps {
	booking: GroupTransportBooking
}

export function ManagerGroupTransportBookingCard({
	booking,
}: ManagerGroupTransportBookingCardProps) {
	const forward = booking.segments.find(seg => seg.direction === "forward")
	const returnSeg = booking.segments.find(seg => seg.direction === "return")

	return (
		<Link
			href={`/manager/group-transport/booking/${booking.id}`}
			className={s.card}
		>
			<div className={s.cardInfo}>
				<p className={s.cardId}>#{booking.id}</p>

				<h3 className={s.cardTitle}>
					{forward ? `${forward.from} → ${forward.to}` : "Маршрут"}
				</h3>

				<p className={s.cardMetaLine}>
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

				<div className={s.status} data-status={booking.status}>
					{BOOKING_STATUS_LABEL[booking.status]}
				</div>
			</div>
		</Link>
	)
}
