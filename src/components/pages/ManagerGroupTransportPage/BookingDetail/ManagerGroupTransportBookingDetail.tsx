"use client"

import { BookingChat } from "@/components/bookings/BookingChat/BookingChat"
import s from "@/components/bookings/BookingDetail/BookingDetail.module.scss"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateGroupTransportBookingStatus } from "@/hooks/useGroupTransportBookingMutations"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import { formatDate } from "@/lib/format"
import { BookingStatus } from "@/types/enums"
import type { GroupTransportBooking } from "@/types/group-transport"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Calendar, ChevronDown, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ManagerGroupTransportBookingDetailProps {
	booking: GroupTransportBooking
}

export function ManagerGroupTransportBookingDetail({
	booking,
}: ManagerGroupTransportBookingDetailProps) {
	const { user } = useAuth()
	const [currentBooking, setCurrentBooking] =
		useState<GroupTransportBooking>(booking)
	const updateStatus = useUpdateGroupTransportBookingStatus()
	const [isStatusOpen, setIsStatusOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const chevronRef = useRef<SVGSVGElement | null>(null)

	useEffect(() => {
		setCurrentBooking(booking)
	}, [booking])

	const statusColor = BOOKING_STATUS_COLOR[currentBooking.status]
	const statusLabel = BOOKING_STATUS_LABEL[currentBooking.status]

	const forward = currentBooking.segments.find(
		seg => seg.direction === "forward"
	)
	const passengersTotal = currentBooking.segments.reduce((acc, seg) => {
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

	const backUrl =
		user?.role === "ADMIN"
			? "/manager/group-transport"
			: user?.role === "MANAGER"
			? "/manager/group-transport"
			: "/client/group-transport"

	const handleStatusChange = async (status: BookingStatus) => {
		if (status === currentBooking.status) {
			setIsStatusOpen(false)

			return
		}

		const updated = await updateStatus.mutateAsync({
			id: currentBooking.id,
			status,
		})

		if (updated) {
			setCurrentBooking({
				...currentBooking,
				status: updated.status,
			})
		}

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

	return (
		<div className={s.container}>
			<div className={s.navigation}>
				<BackButton href={backUrl} label="Назад к бронированиям" />
			</div>

			<div className={s.header}>
				<div>
					<p className={s.bookingId}>Бронирование #{currentBooking.id}</p>

					<h1>Детали перевозки</h1>
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

							<div className={s.infoItem}>
								<Calendar size={20} className={s.infoIcon} />

								<div>
									<p className={s.infoLabel}>Дата создания</p>

									<p className={s.infoValue}>
										{formatDate(currentBooking.createdAt)}
									</p>
								</div>
							</div>
						</div>

						<div className={s.notes}>
							<h3>Маршруты</h3>

							<div className={s.statusGrid}>
								{currentBooking.segments.map(seg => (
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
						</div>

						{currentBooking.note && (
							<div className={s.notes}>
								<h3>Примечание</h3>

								<p>{currentBooking.note}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<BookingChat bookingId={currentBooking.id} scope="group-transport" />
		</div>
	)
}
