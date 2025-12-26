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
import { Calendar, MapPin, Star, Users, X } from "lucide-react"
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

	const getBackUrl = () => {
		if (!user) return "/client/tours"
		if (user.role === "ADMIN") return "/manager/tours"
		if (user.role === "MANAGER") return "/manager/tours"

		return "/client/tours"
	}

	const tourQuery = useQuery({
		queryKey: ["tours", booking.tourId],
		queryFn: () => api.getTour(booking.tourId),
		enabled: !!booking.tourId,
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
						<X size={20} />

						<span>Отменить бронирование</span>
					</button>
				)}
			</div>

			<div className={s.header}>
				<div>
					<p className={s.bookingId}>Бронирование #{booking.id}</p>

					<h1>Детали бронирования</h1>
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
									alt={tourQuery.data.destination}
									fill
									className={s.image}
									sizes="(max-width: 768px) 100vw, 400px"
								/>
							</div>

							<div className={s.tourInfo}>
								<p className={s.tourDestination}>
									{tourQuery.data.destination}
								</p>

								<p className={s.tourDescription}>
									{tourQuery.data.shortDescription}
								</p>

								<div className={s.tourMeta}>
									<span className={s.tourRating}>
										<Star size={16} fill="currentColor" />

										{tourQuery.data.rating}
									</span>

									<span className={s.tourPrice}>
										{formatCurrency(tourQuery.data.price)}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className={s.bookingInfo}>
						<h2>Информация о бронировании</h2>

						<div className={s.infoGrid}>
							<div className={s.infoItem}>
								<Users size={20} className={s.infoIcon} />

								<div>
									<p className={s.infoLabel}>Количество гостей</p>

									<p className={s.infoValue}>{booking.partySize}</p>
								</div>
							</div>

							{booking.startDate && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Дата начала</p>

										<p className={s.infoValue}>
											{formatDate(booking.startDate)}
										</p>
									</div>
								</div>
							)}

							<div className={s.infoItem}>
								<Calendar size={20} className={s.infoIcon} />

								<div>
									<p className={s.infoLabel}>Дата создания</p>

									<p className={s.infoValue}>{formatDate(booking.createdAt)}</p>
								</div>
							</div>

							{booking.updatedAt && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Последнее обновление</p>

										<p className={s.infoValue}>
											{formatDate(booking.updatedAt)}
										</p>
									</div>
								</div>
							)}

							{tourQuery.data && (
								<div className={s.infoItem}>
									<MapPin size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Направление</p>

										<p className={s.infoValue}>{tourQuery.data.destination}</p>
									</div>
								</div>
							)}
						</div>

						{booking.notes && (
							<div className={s.notes}>
								<h3>Заметки</h3>

								<p>{booking.notes}</p>
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
				bookingId={booking.id}
				isPending={cancelBookingMutation.isPending}
			/>
		</div>
	)
}
