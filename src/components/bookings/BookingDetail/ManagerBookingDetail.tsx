"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateBookingStatus } from "@/hooks/useBookingMutations"
import { api } from "@/lib/api"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Booking } from "@/types"
import { BookingStatus } from "@/types/enums"
import { useGSAP } from "@gsap/react"
import { useQuery } from "@tanstack/react-query"
import gsap from "gsap"
import { Calendar, ChevronDown, MapPin, Star, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import s from "./BookingDetail.module.scss"

interface ManagerBookingDetailProps {
	booking: Booking
}

export function ManagerBookingDetail({ booking }: ManagerBookingDetailProps) {
	const { user } = useAuth()
	const [currentBooking, setCurrentBooking] = useState<Booking>(booking)
	const updateStatus = useUpdateBookingStatus()

	useEffect(() => {
		setCurrentBooking(booking)
	}, [booking])

	const tourQuery = useQuery({
		queryKey: ["tours", currentBooking.tourId],
		queryFn: () => api.getTour(currentBooking.tourId),
		enabled: !!currentBooking.tourId,
	})

	const statusColor = BOOKING_STATUS_COLOR[currentBooking.status]
	const statusLabel = BOOKING_STATUS_LABEL[currentBooking.status]
	const [isStatusOpen, setIsStatusOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const chevronRef = useRef<SVGSVGElement | null>(null)

	useGSAP(
		() => {
			if (!chevronRef.current) return

			gsap.to(chevronRef.current, {
				rotate: isStatusOpen ? 180 : 0,
				duration: 0.2,
				ease: "power2.out",
			})
		},
		{ dependencies: [isStatusOpen] }
	)

	useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (
				isStatusOpen &&
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsStatusOpen(false)
			}
		}

		document.addEventListener("click", onClickOutside)
		return () => document.removeEventListener("click", onClickOutside)
	}, [isStatusOpen])

	const handleStatusChange = async (status: BookingStatus) => {
		if (status === currentBooking.status) return
		const updated = await updateStatus.mutateAsync({
			id: currentBooking.id,
			status,
		})
		if (updated) {
			setCurrentBooking(updated)
		}
		setIsStatusOpen(false)
	}

	const backUrl =
		user?.role === "ADMIN"
			? "/manager/tours"
			: user?.role === "MANAGER"
			? "/manager/tours"
			: "/client/tours"

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton href={backUrl} label="Назад к бронированиям" />
			</div>

			<div className={s.header}>
				<div>
					<p className={s.bookingId}>Бронирование #{currentBooking.id}</p>

					<h1>Детали бронирования</h1>
				</div>

				<div className={s.statusDropdown} ref={dropdownRef}>
					<button
						type="button"
						className={s.statusBadge}
						style={{ color: statusColor }}
						onClick={() => setIsStatusOpen(open => !open)}
					>
						<span
							className={s.statusDot}
							style={{ backgroundColor: statusColor }}
						/>

						{statusLabel}

						<ChevronDown ref={chevronRef} className={s.statusChevron} />
					</button>

					<div
						className={`${s.statusList} ${
							isStatusOpen ? s.statusListOpen : ""
						}`}
					>
						{Object.values(BookingStatus).map(status => (
							<button
								key={status}
								type="button"
								className={s.statusItem}
								data-active={status === currentBooking.status}
								onClick={() => handleStatusChange(status)}
								style={{
									color: BOOKING_STATUS_COLOR[status],
								}}
							>
								<span
									className={s.statusDot}
									style={{ backgroundColor: BOOKING_STATUS_COLOR[status] }}
								/>
								{BOOKING_STATUS_LABEL[status]}
							</button>
						))}
					</div>
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

									<p className={s.infoValue}>{currentBooking.partySize}</p>
								</div>
							</div>

							{currentBooking.startDate && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Дата начала</p>

										<p className={s.infoValue}>
											{formatDate(currentBooking.startDate)}
										</p>
									</div>
								</div>
							)}

							<div className={s.infoItem}>
								<Calendar size={20} className={s.infoIcon} />

								<div>
									<p className={s.infoLabel}>Дата создания</p>

									<p className={s.infoValue}>
										{formatDate(currentBooking.createdAt)}
									</p>
								</div>
							</div>

							{currentBooking.updatedAt && (
								<div className={s.infoItem}>
									<Calendar size={20} className={s.infoIcon} />

									<div>
										<p className={s.infoLabel}>Последнее обновление</p>

										<p className={s.infoValue}>
											{formatDate(currentBooking.updatedAt)}
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

						{currentBooking.notes && (
							<div className={s.notes}>
								<h3>Заметки</h3>

								<p>{currentBooking.notes}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<BookingChat bookingId={currentBooking.id} />
		</div>
	)
}
