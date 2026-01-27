"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useCancelBooking } from "@/hooks/useBookingMutations"
import { api } from "@/lib/api"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Booking } from "@/types"
import { BookingStatus } from "@/types/enums"
import { useQuery } from "@tanstack/react-query"
import { Calendar, CalendarDays, MapPin, Moon, Sun, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import s from "./BookingDetail.module.scss"
import { CancelBookingModal } from "./ui/CancelBookingModal/CancelBookingModal"

interface BookingDetailProps {
	booking: Booking
}

export function BookingDetail({ booking }: BookingDetailProps) {
	const router = useRouter()
	const { user } = useAuth()
	const [showCancelModal, setShowCancelModal] = useState(false)
	const cancelBookingMutation = useCancelBooking()
	const displayBookingId = booking.publicId ?? booking.id

	const getBackUrl = () => {
		if (!user) return "/client/tours"
		if (user.role === "ADMIN") return "/manager/tours"
		if (user.role === "MANAGER") return "/manager/tours"

		return "/client/tours"
	}

	const tourLookupId = booking.tourPublicId ?? booking.tourId
	const tourQuery = useQuery({
		queryKey: ["tours", tourLookupId],
		queryFn: () => api.getTour(tourLookupId),
		enabled: !!tourLookupId,
	})

	const canCancel =
		booking.status !== BookingStatus.CANCELLED &&
		booking.status !== BookingStatus.COMPLETED

	const handleCancel = async () => {
		await cancelBookingMutation.mutateAsync(booking.id)

		setShowCancelModal(false)

		setTimeout(() => {
			router.push(getBackUrl())
		}, 1000)
	}

	const statusLabel = BOOKING_STATUS_LABEL[booking.status]
	const statusColor = BOOKING_STATUS_COLOR[booking.status]

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton href={getBackUrl()} label="Назад к бронированиям" />

				{canCancel && (
					<button
						type="button"
						className={s.cancelButton}
						onClick={() => setShowCancelModal(true)}
						disabled={cancelBookingMutation.isPending}
					>
						<X size={"2rem"} />

						<span>Отменить бронирование</span>
					</button>
				)}
			</div>

			<div className={s.header}>
				<div className={s.headerContent}>
					<p className={s.bookingId}>Бронирование #{displayBookingId}</p>

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
					{tourQuery.isLoading && (
						<LoadingSpinner text="Загрузка информации о туре..." />
					)}

					{tourQuery.error && (
						<ErrorMessage
							title="Ошибка загрузки тура"
							message="Не удалось загрузить информацию о туре."
							error={tourQuery.error as Error}
						/>
					)}

					{tourQuery.data && (
						<div className={s.tourCard}>
							<div className={s.tourImage}>
								<Image
									src={tourQuery.data.image}
									alt={tourQuery.data.title}
									fill
									className={s.image}
									sizes="(max-width: 768px) 100vw, 400px"
								/>
							</div>

							<div className={s.tourInfo}>
								<p className={s.tourDestination}>{tourQuery.data.title}</p>

								<p className={s.tourDescription}>
									{tourQuery.data.shortDescription}
								</p>

								{tourQuery.data.tags.length > 0 && (
									<ul className={s.tagsList}>
										{tourQuery.data.tags.map((tag, index) => (
											<li key={`${tag}-${index}`} className={s.tagBadge}>
												{tag}
											</li>
										))}
									</ul>
								)}

								<div className={s.metaBadges}>
									{tourQuery.data.dateFrom && tourQuery.data.dateTo && (
										<div className={`${s.metaBadge} ${s.metaBadgeDate}`}>
											<CalendarDays size={"1.8rem"} />

											<span>
												{formatDate(tourQuery.data.dateFrom)} —{" "}
												{formatDate(tourQuery.data.dateTo)}
											</span>
										</div>
									)}

									{(tourQuery.data.durationDays ||
										tourQuery.data.durationNights) && (
										<div className={`${s.metaBadge} ${s.metaBadgeDuration}`}>
											<div className={s.metaIconGroup}>
												<Sun size={"1.6rem"} />

												<Moon size={"1.6rem"} />
											</div>

											<span>
												{[
													tourQuery.data.durationDays
														? `${tourQuery.data.durationDays} дн.`
														: null,
													tourQuery.data.durationNights
														? `${tourQuery.data.durationNights} ноч.`
														: null,
												]
													.filter(Boolean)
													.join(" / ")}
											</span>
										</div>
									)}
								</div>

								<div className={s.tourMeta}>
									<span className={s.tourPrice}>
										{formatCurrency(tourQuery.data.price)}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className={s.bookingInfo}>
						<h2 className={s.bookingInfoTitle}>Информация о бронировании</h2>

						<div className={s.infoGrid}>
							<div className={s.infoItem}>
								<Calendar size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Дата создания</p>

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

							{tourQuery.data && (
								<div className={s.infoItem}>
									<MapPin size={"2rem"} className={s.infoIcon} />

									<div className={s.infoItemWrapper}>
										<p className={s.infoLabel}>Тур</p>

										<p className={s.infoValue}>{tourQuery.data.title}</p>
									</div>
								</div>
							)}
						</div>

						<div className={s.participants}>
							<div className={s.participantsHeader}>
								<h3 className={s.participantsTitle}>Участники</h3>

								<span className={s.participantsCount}>
									{booking.participants.length}
								</span>
							</div>

							<div className={s.participantsList}>
								{booking.participants.map((participant, index) => (
									<div key={index} className={s.participantCard}>
										<div className={s.participantTop}>
											<p className={s.participantName}>
												{participant.fullName}
											</p>

											<span className={s.participantIndex}>#{index + 1}</span>
										</div>

										<div className={s.participantMeta}>
											<span>
												Дата рождения: {formatDate(participant.birthDate)}
											</span>

											<span>
												Пол:{" "}
												{participant.gender === "male" ? "Мужской" : "Женский"}
											</span>

											<span>Паспорт: {participant.passportNumber}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{booking.notes && (
							<div className={s.notes}>
								<h3 className={s.notesTitle}>Заметки</h3>

								<p className={s.notesText}>{booking.notes}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<BookingChat bookingId={booking.id} />

			<CancelBookingModal
				isOpen={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				onConfirm={handleCancel}
				bookingId={displayBookingId}
				isPending={cancelBookingMutation.isPending}
			/>
		</div>
	)
}
