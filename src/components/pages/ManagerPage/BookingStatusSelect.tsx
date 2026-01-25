"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useUpdateBookingStatus } from "@/hooks/useBookingMutations"
import {
	BOOKING_STATUS_COLOR,
	BOOKING_STATUS_LABEL,
} from "@/lib/booking-status"
import type { Booking } from "@/types"
import type { BookingStatus } from "@/types/enums"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import s from "./BookingStatusSelect.module.scss"

interface BookingStatusSelectProps {
	booking: Booking
}

export function BookingStatusSelect({ booking }: BookingStatusSelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const updateStatusMutation = useUpdateBookingStatus()

	const handleStatusChange = async (newStatus: BookingStatus) => {
		if (newStatus === booking.status) {
			setIsOpen(false)

			return
		}

		await updateStatusMutation.mutateAsync({
			id: booking.id,
			status: newStatus,
		})

		setIsOpen(false)
	}

	const currentStatusLabel = BOOKING_STATUS_LABEL[booking.status]
	const currentStatusColor = BOOKING_STATUS_COLOR[booking.status]
	const isUpdating = updateStatusMutation.isPending

	return (
		<div className={s.wrapper}>
			<button
				type="button"
				className={s.trigger}
				onClick={() => setIsOpen(!isOpen)}
				disabled={isUpdating}
				style={{ borderColor: currentStatusColor }}
			>
				<span
					className={s.statusDot}
					style={{ backgroundColor: currentStatusColor }}
				/>

				<span className={s.statusLabel}>{currentStatusLabel}</span>

				{isUpdating ? (
					<LoadingSpinner size="small" />
				) : (
					<ChevronDown size={"1.6rem"} className={s.chevron} />
				)}
			</button>

			{isOpen && (
				<>
					<div className={s.backdrop} onClick={() => setIsOpen(false)} />

					<div className={s.dropdown}>
						{Object.entries(BOOKING_STATUS_LABEL).map(([status, label]) => {
							const statusValue = status as BookingStatus
							const isSelected = booking.status === statusValue
							const color = BOOKING_STATUS_COLOR[statusValue]

							return (
								<button
									key={status}
									type="button"
									className={`${s.option} ${isSelected ? s.selected : ""}`}
									onClick={() => handleStatusChange(statusValue)}
									disabled={isUpdating}
								>
									<span
										className={s.optionDot}
										style={{ backgroundColor: color }}
									/>

									<span>{label}</span>

									{isSelected && (
										<Check size={"1.6rem"} className={s.checkIcon} />
									)}
								</button>
							)
						})}
					</div>
				</>
			)}
		</div>
	)
}
