"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import s from "@/components/bookings/BookingDetail/BookingDetail.module.scss"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { GroupTransportBooking } from "@/types/group-transport"
import { Calendar, Users } from "lucide-react"

interface GroupTransportBookingDetailProps {
	booking: GroupTransportBooking
}

export function GroupTransportBookingDetail({
	booking,
}: GroupTransportBookingDetailProps) {
	const backUrl = "/client/group-transport"
	const forward = booking.segments.find(seg => seg.direction === "forward")
	const passengersTotal = booking.segments.reduce((acc, seg) => {
		const p = seg.passengers
		return (
			acc +
			p.seniorsEco +
			p.adultsEco +
			p.youthEco +
			p.childrenEco +
			p.infantsEco +
			p.seniorsBusiness +
			p.adultsBusiness +
			p.youthBusiness +
			p.childrenBusiness +
			p.infantsBusiness
		)
	}, 0)

	const statusLabel = BOOKING_STATUS_LABEL[booking.status]
	const statusColor = BOOKING_STATUS_COLOR[booking.status]

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton href={backUrl} label="Назад к бронированиям" />
			</div>

			<div className={s.header}>
				<div>
					<p className={s.bookingId}>Бронирование #{booking.id}</p>
					<h1>
						{forward ? `${forward.from} → ${forward.to}` : "Детали перевозки"}
					</h1>
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
						<h2>Информация о перевозке</h2>

						<div className={s.infoGrid}>
							<div className={s.infoItem}>
								<Users size={20} className={s.infoIcon} />

								<div>
									<p className={s.infoLabel}>Пассажиров</p>

									<p className={s.infoValue}>{passengersTotal}</p>
								</div>
							</div>

							{forward?.departureDate && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Вылет туда</p>

										<p className={s.infoValue}>
											{formatDate(forward.departureDate)}
										</p>
									</div>
								</div>
							)}

							{booking.createdAt && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Создано</p>

										<p className={s.infoValue}>
											{formatDate(booking.createdAt)}
										</p>
									</div>
								</div>
							)}
						</div>

						<div className={s.notes}>
							<h3>Маршруты</h3>
							{booking.segments.map(seg => (
								<div key={`${seg.direction}-${seg.departureDate}`}>
									<p className={s.infoLabel}>
										{seg.direction === "forward" ? "Туда" : "Обратно"} ·{" "}
										{seg.departureDate
											? formatDate(seg.departureDate)
											: "Дата уточняется"}
									</p>

									<p className={s.infoValue}>
										{seg.from} → {seg.to} · рейс{" "}
										{seg.flightNumber || "по запросу"}
									</p>
								</div>
							))}
						</div>

						{booking.note && (
							<div className={s.notes}>
								<h3>Примечание</h3>

								<p>{booking.note}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<BookingChat bookingId={booking.id} scope="group-transport" />
		</div>
	)
}
