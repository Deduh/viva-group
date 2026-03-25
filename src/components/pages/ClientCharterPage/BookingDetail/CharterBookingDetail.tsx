"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import s from "@/components/bookings/BookingDetail/BookingDetail.module.scss"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import {
	CHARTER_TRIP_TYPE_LABEL,
	normalizeCharterTripType,
} from "@/lib/charter-trip-type"
import { formatDate } from "@/lib/format"
import { useAuth } from "@/hooks/useAuth"
import type { CharterBooking } from "@/types"
import { ArrowRightLeft, Calendar, MapPin, Tags, Users } from "lucide-react"

interface CharterBookingDetailProps {
	booking: CharterBooking
}

export function CharterBookingDetail({ booking }: CharterBookingDetailProps) {
	const { user } = useAuth()
	const statusLabel = BOOKING_STATUS_LABEL[booking.status]
	const statusColor = BOOKING_STATUS_COLOR[booking.status]
	const from = booking.flight?.from || booking.from || "Не указано"
	const to = booking.flight?.to || booking.to || "Не указано"
	const displayBookingId = booking.publicId ?? booking.id
	const tripType = normalizeCharterTripType(booking.tripType)
	const categories = booking.categories ?? booking.flight?.categories ?? []

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton
					href={user?.role === "AGENT" ? "/agent/flights" : "/client/flights"}
					label="Назад к заявкам"
				/>
			</div>

			<div className={s.header}>
				<div className={s.headerContent}>
					<p className={s.bookingId}>Заявка #{displayBookingId}</p>

					<h1 className={s.headerTitle}>Детали бронирования</h1>
				</div>

				<div
					className={s.statusBadge}
					style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
				>
					<span
						className={s.statusDot}
						style={{ backgroundColor: statusColor }}
					/>

					{statusLabel}
				</div>
			</div>

			<div className={s.content}>
				<div className={s.mainInfo}>
					<div className={s.bookingInfo}>
						<h2 className={s.bookingInfoTitle}>Информация о бронировании</h2>

						<div className={s.infoGridThreeCols}>
							<div className={s.infoItem}>
								<MapPin size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Маршрут</p>

									<p className={s.infoValue}>
										{from} → {to}
									</p>
								</div>
							</div>

							<div className={s.infoItem}>
								<ArrowRightLeft size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Тип перелета</p>

									<p className={s.infoValue}>
										{CHARTER_TRIP_TYPE_LABEL[tripType]}
									</p>
								</div>
							</div>

							<div className={s.infoItem}>
								<Calendar size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Даты</p>

									<p className={`${s.infoValue} ${s.nowrap}`}>
										{tripType === "ONE_WAY" || !booking.dateTo
											? `Вылет: ${formatDate(booking.dateFrom)}`
											: `${formatDate(booking.dateFrom)} - ${formatDate(booking.dateTo)}`}
									</p>

									{tripType === "ONE_WAY" && (
										<p className={s.infoValue}>Обратный рейс: не нужен</p>
									)}
								</div>
							</div>

							<div className={s.infoItem}>
								<Users size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Пассажиры</p>

									<p className={s.infoValue}>
										{booking.adults} взрослых
										{booking.children ? `, ${booking.children} детей` : ""}
									</p>
								</div>
							</div>

							{categories.length > 0 && (
								<div className={s.infoItem}>
									<Tags size={"2rem"} className={s.infoIcon} />

									<div className={s.infoItemWrapper}>
										<p className={s.infoLabel}>Категории</p>

										<ul className={s.tagsList}>
											{categories.map((cat, index) => (
												<li key={`${cat}-${index}`} className={s.tagBadge}>
													{cat}
												</li>
											))}
										</ul>
									</div>
								</div>
							)}

							<div className={s.infoItem}>
								<Calendar size={"2rem"} className={s.infoIcon} />
								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Создано</p>

									<p className={s.infoValue}>{formatDate(booking.createdAt)}</p>
								</div>
							</div>

							{booking.updatedAt && (
								<div className={s.infoItem}>
									<Calendar size={"2rem"} className={s.infoIcon} />

									<div className={s.infoItemWrapper}>
										<p className={s.infoLabel}>Последнее обновление</p>

										<p className={s.infoValue}>
											{formatDate(booking.updatedAt)}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<BookingChat bookingId={booking.id} scope="charter" />
		</div>
	)
}
