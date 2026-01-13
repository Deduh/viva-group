"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useUpdateBookingStatus } from "@/hooks/useBookingMutations"
import type { Booking } from "@/types"
import type { BookingStatus } from "@/types/enums"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import s from "./BookingStatusSelect.module.scss"

interface BookingStatusSelectProps {
	booking: Booking
}

const statusLabels: Record<BookingStatus, string> = {
	PENDING: "Ожидает",
	CONFIRMED: "Подтверждено",
	CANCELLED: "Отменено",
	IN_PROGRESS: "В процессе",
	COMPLETED: "Завершено",
}

const statusColors: Record<BookingStatus, string> = {
	PENDING: "#f59e0b",
	CONFIRMED: "#10b981",
	CANCELLED: "#ef4444",
	IN_PROGRESS: "#0797a6",
	COMPLETED: "#8b5cf6",
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

	const currentStatusLabel = statusLabels[booking.status]
	const currentStatusColor = statusColors[booking.status]
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
					<ChevronDown size={16} className={s.chevron} />
				)}
			</button>

			{isOpen && (
				<>
					<div className={s.backdrop} onClick={() => setIsOpen(false)} />
					<div className={s.dropdown}>
						{Object.entries(statusLabels).map(([status, label]) => {
							const statusValue = status as BookingStatus
							const isSelected = booking.status === statusValue
							const color = statusColors[statusValue]

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
									{isSelected && <Check size={16} className={s.checkIcon} />}
								</button>
							)
						})}
					</div>
				</>
			)}
		</div>
	)
}
