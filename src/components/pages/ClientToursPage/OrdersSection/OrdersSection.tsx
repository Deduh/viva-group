"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useCurrency } from "@/context/CurrencyContext"
import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { BookingOrder } from "@/types"
import Link from "next/link"
import s from "./OrdersSection.module.scss"

interface OrdersSectionProps {
	orders: BookingOrder[]
	isLoading: boolean
}

export function OrdersSection({ orders, isLoading }: OrdersSectionProps) {
	const { formatPrice } = useCurrency()

	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2 className={s.title}>Мои заказы</h2>
				{orders.length > 0 && <span className={s.counter}>{orders.length}</span>}
			</div>

			{isLoading ? (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка заказов..." />
				</div>
			) : orders.length === 0 ? (
				<div className={s.empty}>
					<p className={s.emptyText}>
						Пока нет оформленных заказов. Добавьте туры в корзину и отправьте
						первый заказ менеджеру.
					</p>
				</div>
			) : (
				<div className={s.list}>
					{orders.map(order => (
						<Link
							key={order.id}
							href={`/client/tours/booking/${order.publicId}`}
							className={s.card}
						>
							<div className={s.cardMain}>
								<p className={s.orderId}>#{order.publicId}</p>
								<h3 className={s.cardTitle}>Заказ по турам</h3>
								<p className={s.meta}>
									Создан {formatDate(order.createdAt)} · Позиций: {order.itemsCount}
								</p>
								<p className={s.meta}>
									Статусов: {order.bookings.length} item booking
								</p>
							</div>

							<div className={s.cardAside}>
								<div className={s.totalBox}>
									<span className={s.totalLabel}>Сумма заказа</span>
									<strong className={s.totalValue}>
										{formatPrice(order.totalAmount, order.currency)}
									</strong>
								</div>

								<div className={s.statuses}>
									{order.bookings.slice(0, 3).map(booking => (
										<span key={booking.id} className={s.status}>
											{BOOKING_STATUS_LABEL[booking.status]}
										</span>
									))}
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</section>
	)
}
