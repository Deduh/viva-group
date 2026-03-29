"use client"

import { BackButton } from "@/components/ui/BackButton/BackButton"
import { useCurrency } from "@/context/CurrencyContext"
import { BOOKING_STATUS_LABEL } from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { BookingOrder } from "@/types"
import Link from "next/link"
import s from "./OrderDetailView.module.scss"

interface OrderDetailViewProps {
	order: BookingOrder
	backHref: string
	backLabel: string
	bookingHrefBuilder: (bookingId: string) => string
	showCustomer?: boolean
}

export function OrderDetailView({
	order,
	backHref,
	backLabel,
	bookingHrefBuilder,
	showCustomer = false,
}: OrderDetailViewProps) {
	const { formatPrice } = useCurrency()

	return (
		<div className={s.shell}>
			<BackButton href={backHref} label={backLabel} />

			<section className={s.hero}>
				<div>
					<p className={s.kicker}>Booking Order</p>
					<h1 className={s.title}>Заказ {order.publicId}</h1>
					<p className={s.meta}>
						Создан {formatDate(order.createdAt)} · Позиций: {order.itemsCount}
					</p>
					{showCustomer && order.user && (
						<p className={s.meta}>
							Клиент: {order.user.name || "Без имени"} · {order.user.email}
						</p>
					)}
				</div>

				<div className={s.totalCard}>
					<span>Итог заказа</span>
					<strong>{formatPrice(order.totalAmount, order.currency)}</strong>
				</div>
			</section>

			<div className={s.list}>
				{order.bookings.map(booking => {
					const snapshot = booking.pricingSnapshot
					const snapshotTour = snapshot?.tour
					const title =
						booking.tour?.title ||
						snapshotTour?.title ||
						booking.tourPublicId ||
						booking.tourId
					const departureLabel =
						snapshotTour?.departureLabel ?? booking.departureLabel
					const dateFrom =
						snapshotTour?.dateFrom ??
						booking.departureDateFrom ??
						booking.tour?.dateFrom
					const dateTo =
						snapshotTour?.dateTo ??
						booking.departureDateTo ??
						booking.tour?.dateTo

					return (
						<article key={booking.id} className={s.card}>
							<div className={s.cardHeader}>
								<div>
									<p className={s.bookingId}>#{booking.publicId ?? booking.id}</p>
									<h2 className={s.cardTitle}>{title}</h2>
									<p className={s.cardMeta}>
										Статус: {BOOKING_STATUS_LABEL[booking.status]}
									</p>
									{departureLabel && (
										<p className={s.cardMeta}>Выезд: {departureLabel}</p>
									)}
									{dateFrom && dateTo && (
										<p className={s.cardMeta}>
											Даты: {formatDate(dateFrom)} - {formatDate(dateTo)}
										</p>
									)}
								</div>

								<div className={s.cardAside}>
									<span className={s.itemTotal}>
										{formatPrice(
											booking.totalAmount ?? snapshot?.totalAmount ?? 0,
											order.currency,
										)}
									</span>
									<Link
										href={bookingHrefBuilder(booking.publicId ?? booking.id)}
										className={s.detailLink}
									>
										Открыть booking
									</Link>
								</div>
							</div>

							{snapshot?.participants?.length ? (
								<div className={s.participants}>
									{snapshot.participants.map((participant, index) => (
										<div key={`${booking.id}-${index}`} className={s.participant}>
											<div>
												<h3 className={s.participantName}>
													{participant.fullNameLatin}
												</h3>
												<p className={s.participantMeta}>
													Паспорт {participant.passportNumber} · действует до{" "}
													{formatDate(participant.passportExpiresAt)}
												</p>
												<p className={s.participantMeta}>
													{participant.selectedHotelName
														? `Отель: ${participant.selectedHotelName}`
														: "Отель не требуется"}
												</p>
											</div>

											<div className={s.breakdown}>
												<span>
													База:{" "}
													{formatPrice(
														participant.baseTourPrice,
														snapshot.tour.baseCurrency,
													)}
												</span>
												<span>
													Отель:{" "}
													{formatPrice(
														participant.hotelSupplement,
														snapshot.tour.baseCurrency,
													)}
												</span>
												<strong>
													{formatPrice(participant.total, snapshot.tour.baseCurrency)}
												</strong>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className={s.participants}>
									{booking.participants.map((participant, index) => (
										<div
											key={`${booking.id}-fallback-${index}`}
											className={s.participant}
										>
											<div>
												<h3 className={s.participantName}>
													{participant.fullNameLatin || participant.fullName}
												</h3>
												<p className={s.participantMeta}>
													Паспорт {participant.passportNumber}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</article>
					)
				})}
			</div>
		</div>
	)
}
