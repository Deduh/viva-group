import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useDebounce } from "@/hooks/useDebounce"
import type { Booking } from "@/types"
import { useMemo, useState } from "react"
import s from "./ManagerBookingsSection.module.scss"
import { ManagerBookingCard } from "./ui/ManagerBookingCard/ManagerBookingCard"
import { ManagerBookingsSearch } from "./ui/ManagerBookingsSearch/ManagerBookingsSearch"

interface ManagerBookingsSectionProps {
	bookings: Booking[]
	isLoading: boolean
}

export function ManagerBookingsSection({
	bookings,
	isLoading,
}: ManagerBookingsSectionProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 300)

	const filtered = useMemo(() => {
		if (!debouncedSearch.trim()) return bookings

		const q = debouncedSearch.toLowerCase().trim()

		return bookings.filter(
			b =>
				b.id.toLowerCase().includes(q) ||
				(b.publicId || "").toLowerCase().includes(q) ||
				b.tourId.toLowerCase().includes(q) ||
				(b.tourPublicId || "").toLowerCase().includes(q) ||
				(b.notes || "").toLowerCase().includes(q),
		)
	}, [bookings, debouncedSearch])

	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2 className={s.title}>Брони туров</h2>

				{bookings.length > 0 && (
					<span className={s.cardMeta}>Всего: {bookings.length}</span>
				)}
			</div>

			<ManagerBookingsSearch value={search} onChange={setSearch} />

			{isLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка бронирований..." />
				</div>
			) : filtered.length === 0 ? (
				<div className={s.empty}>Бронирований пока нет</div>
			) : (
				<div className={s.list}>
					{filtered.map(booking => (
						<ManagerBookingCard key={booking.id} booking={booking} />
					))}
				</div>
			)}
		</section>
	)
}
