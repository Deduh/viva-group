"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import s from "@/components/bookings/BookingDetail/BookingDetail.module.scss"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateCharterBookingStatus } from "@/hooks/useCharterBookingMutations"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import type { CharterBooking } from "@/types"
import { BookingStatus } from "@/types/enums"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Calendar, ChevronDown, MapPin, Tags, User, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ManagerFlightsBookingDetailProps {
	booking: CharterBooking
}

export function ManagerCharterBookingDetail({
	booking,
}: ManagerFlightsBookingDetailProps) {
	const { user } = useAuth()
	const [currentBooking, setCurrentBooking] = useState<CharterBooking>(booking)
	const updateStatus = useUpdateCharterBookingStatus()
	const displayBookingId = currentBooking.publicId ?? currentBooking.id
	const [isStatusOpen, setIsStatusOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const chevronRef = useRef<SVGSVGElement | null>(null)

	useEffect(() => {
		setCurrentBooking(booking)
	}, [booking])

	const statusColor = BOOKING_STATUS_COLOR[currentBooking.status]
	const statusLabel = BOOKING_STATUS_LABEL[currentBooking.status]
	const from =
		currentBooking.flight?.from || currentBooking.from || "Не указано"
	const to = currentBooking.flight?.to || currentBooking.to || "Не указано"
	const categories =
		currentBooking.categories ?? currentBooking.flight?.categories ?? []

	const backUrl =
		user?.role === "ADMIN" || user?.role === "MANAGER"
			? "/manager/flights"
			: "/client/flights"

	const handleStatusChange = async (status: BookingStatus) => {
		if (status === currentBooking.status) {
			setIsStatusOpen(false)

			return
		}

		const updated = await updateStatus.mutateAsync({
			id: currentBooking.id,
			status,
		})

		setCurrentBooking(updated)
		setIsStatusOpen(false)
	}

	useGSAP(
		() => {
			if (!chevronRef.current) return

			gsap.to(chevronRef.current, {
				rotate: isStatusOpen ? 180 : 0,
				duration: 0.2,
				ease: "power2.out",
			})
		},
		{ dependencies: [isStatusOpen] },
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

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton href={backUrl} label="Назад к заявкам" />
			</div>

			<div className={s.header}>
				<div className={s.headerContent}>
					<p className={s.bookingId}>Заявка #{displayBookingId}</p>

					<h1 className={s.headerTitle}>Детали бронирования</h1>
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
								style={{ color: BOOKING_STATUS_COLOR[status] }}
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

							{currentBooking.flight?.publicId && (
								<div className={s.infoItem}>
									<MapPin size={"2rem"} className={s.infoIcon} />

									<div className={s.infoItemWrapper}>
										<p className={s.infoLabel}>Рейс</p>

										<p className={s.infoValue}>
											{currentBooking.flight.publicId}
										</p>
									</div>
								</div>
							)}

							<div className={s.infoItem}>
								<Calendar size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Даты</p>

									<p className={`${s.infoValue} ${s.nowrap}`}>
										{formatDate(currentBooking.dateFrom)} -{" "}
										{formatDate(currentBooking.dateTo)}
									</p>
								</div>
							</div>

							<div className={s.infoItem}>
								<Users size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Пассажиры</p>

									<p className={s.infoValue}>
										{currentBooking.adults} взрослых
										{currentBooking.children
											? `, ${currentBooking.children} детей`
											: ""}
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

									<p className={s.infoValue}>
										{formatDate(currentBooking.createdAt)}
									</p>
								</div>
							</div>

							<div className={s.infoItem}>
								<Calendar size={"2rem"} className={s.infoIcon} />

								<div className={s.infoItemWrapper}>
									<p className={s.infoLabel}>Последнее обновление</p>

									<p className={s.infoValue}>
										{formatDate(currentBooking.updatedAt)}
									</p>
								</div>
							</div>

							{currentBooking.user && (
								<div className={s.infoItem}>
									<User size={"2rem"} className={s.infoIcon} />

									<div className={s.infoItemWrapper}>
										<p className={s.infoLabel}>Клиент</p>

										<p className={s.infoValue}>
											{currentBooking.user.name || currentBooking.user.email}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<BookingChat bookingId={currentBooking.id} scope="charter" />
		</div>
	)
}
