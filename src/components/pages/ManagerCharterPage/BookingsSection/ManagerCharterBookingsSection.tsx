"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useDebounce } from "@/hooks/useDebounce"
import type { CharterBooking } from "@/types"
import { useMemo, useState } from "react"
import s from "./ManagerCharterBookingsSection.module.scss"
import { ManagerCharterBookingCard } from "./ui/ManagerCharterBookingCard/ManagerCharterBookingCard"
import { ManagerCharterBookingsSearch } from "./ui/ManagerCharterBookingsSearch/ManagerCharterBookingsSearch"

interface ManagerCharterBookingsSectionProps {
	bookings: CharterBooking[]
	isBookingsLoading: boolean
}

export function ManagerCharterBookingsSection({
	bookings,
	isBookingsLoading,
}: ManagerCharterBookingsSectionProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 300)

	const filtered = useMemo(() => {
		if (!debouncedSearch.trim()) return bookings

		const q = debouncedSearch.toLowerCase().trim()

		return bookings.filter(b => {
			const userName = (b.user?.name || "").toLowerCase()
			const userEmail = (b.user?.email || "").toLowerCase()
			const from = b.flight?.from || b.from || ""
			const to = b.flight?.to || b.to || ""
			const route = `${from} ${to}`.toLowerCase()

			return (
				b.id.toLowerCase().includes(q) ||
				b.publicId.toLowerCase().includes(q) ||
				route.includes(q) ||
				userName.includes(q) ||
				userEmail.includes(q)
			)
		})
	}, [bookings, debouncedSearch])

	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2 className={s.title}>Бронирования авиабилетов</h2>

				{bookings.length > 0 && (
					<span className={s.cardMeta}>Всего: {bookings.length}</span>
				)}
			</div>

			{/* // TODO: Много таких инпутов, вынести в один переиспользуемый */}
			<ManagerCharterBookingsSearch value={search} onChange={setSearch} />

			{isBookingsLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка заявок..." />
				</div>
			) : filtered.length === 0 ? (
				<div className={s.empty}>Заявок пока нет</div>
			) : (
				<div className={s.list}>
					{filtered.map(booking => (
						<ManagerCharterBookingCard key={booking.id} booking={booking} />
					))}
				</div>
			)}
		</section>
	)
}
