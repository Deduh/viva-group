"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useDebounce } from "@/hooks/useDebounce"
import type { GroupTransportBooking } from "@/types/group-transport"
import { useMemo, useState } from "react"
import s from "./ManagerGroupTransportBookingsSection.module.scss"
import { ManagerGroupTransportBookingCard } from "./ui/ManagerGroupTransportBookingCard/ManagerGroupTransportBookingCard"
import { ManagerGroupTransportBookingsSearch } from "./ui/ManagerGroupTransportBookingsSearch/ManagerGroupTransportBookingsSearch"

interface ManagerGroupTransportBookingsSectionProps {
	bookings: GroupTransportBooking[]
	isLoading: boolean
}

export function ManagerGroupTransportBookingsSection({
	bookings,
	isLoading,
}: ManagerGroupTransportBookingsSectionProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 300)

	const filtered = useMemo(() => {
		if (!debouncedSearch.trim()) return bookings

		const q = debouncedSearch.toLowerCase().trim()

		return bookings.filter(b => {
			const forward = b.segments.find(seg => seg.direction === "forward")
			const route = forward && `${forward.from} ${forward.to}`.toLowerCase()

			return (
				b.id.toLowerCase().includes(q) ||
				route?.includes(q) ||
				(b.note || "").toLowerCase().includes(q)
			)
		})
	}, [bookings, debouncedSearch])

	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2 className={s.title}>Брони перевозок</h2>

				{bookings.length > 0 && (
					<span className={s.cardMeta}>Всего: {bookings.length}</span>
				)}
			</div>

			<ManagerGroupTransportBookingsSearch
				value={search}
				onChange={setSearch}
			/>

			{isLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка бронирований..." />
				</div>
			) : filtered.length === 0 ? (
				<div className={s.empty}>Бронирований пока нет</div>
			) : (
				<div className={s.list}>
					{filtered.map(booking => (
						<ManagerGroupTransportBookingCard
							key={booking.id}
							booking={booking}
						/>
					))}
				</div>
			)}
		</section>
	)
}
