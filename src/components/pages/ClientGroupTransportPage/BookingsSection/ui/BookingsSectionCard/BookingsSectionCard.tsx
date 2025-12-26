"use client"

import { formatDate } from "@/lib/format"
import type { GroupTransportBooking } from "@/types/group-transport"
import Link from "next/link"
import s from "./BookingsSectionCard.module.scss"

type Props = {
	booking: GroupTransportBooking
}

const statusLabels: Record<GroupTransportBooking["status"], string> = {
	PENDING: "Ожидает подтверждения",
	CONFIRMED: "Подтверждено",
	CANCELLED: "Отменено",
	IN_PROGRESS: "В процессе",
	COMPLETED: "Завершено",
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
					{statusLabels[booking.status]}
				</div>
			</div>
		</Link>
	)
}
