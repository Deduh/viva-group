"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { BookingOrder } from "@/types"
import Link from "next/link"
import s from "./ManagerBookingCard.module.scss"

interface ManagerBookingCardProps {
	order: BookingOrder
}

export function ManagerBookingCard({ order }: ManagerBookingCardProps) {
	const { formatPrice } = useCurrency()
	const displayOrderId = order.publicId ?? order.id
	const customer = order.user?.name || order.user?.email || "Клиент без имени"
	const statuses = Array.from(new Set(order.bookings.map(booking => booking.status)))

	return (
		<Link
			href={`/manager/tours/booking/${displayOrderId}`}
			className={s.card}
		>
			<div className={s.cardInfo}>
				<div className={s.summaryRow}>
					<div>
						<p className={s.cardId}>#{displayOrderId}</p>
						<h3 className={s.cardTitle}>{customer}</h3>
					</div>

					<div className={s.totalBox}>
						<span className={s.totalLabel}>Сумма заказа</span>
						<strong className={s.totalValue}>
							{formatPrice(order.totalAmount, order.currency)}
						</strong>
					</div>
				</div>

				<p className={s.cardMeta}>
					{order.createdAt ? `Создано: ${formatDate(order.createdAt)} · ` : ""}
					Позиций: {order.itemsCount}
				</p>

				<div className={s.statusGroup}>
					{statuses.slice(0, 3).map(status => (
						<div key={status} className={s.status} data-status={status}>
							{BOOKING_STATUS_LABEL[status]}
						</div>
					))}
				</div>
			</div>
		</Link>
	)
}
