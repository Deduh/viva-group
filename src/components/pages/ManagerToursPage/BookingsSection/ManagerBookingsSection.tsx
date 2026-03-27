import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useDebounce } from "@/hooks/useDebounce"
import { useUpdateTourCartLeadStatus } from "@/hooks/useBookingOrders"
import type { BookingOrder, TourCartLead } from "@/types"
import { useMemo, useState } from "react"
import s from "./ManagerBookingsSection.module.scss"
import { ManagerBookingCard } from "./ui/ManagerBookingCard/ManagerBookingCard"
import { ManagerBookingsSearch } from "./ui/ManagerBookingsSearch/ManagerBookingsSearch"

interface ManagerBookingsSectionProps {
	orders: BookingOrder[]
	leads: TourCartLead[]
	isLoading: boolean
	leadsLoading: boolean
}

export function ManagerBookingsSection({
	orders,
	leads,
	isLoading,
	leadsLoading,
}: ManagerBookingsSectionProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 300)
	const updateLeadStatus = useUpdateTourCartLeadStatus()

	const filteredOrders = useMemo(() => {
		if (!debouncedSearch.trim()) return orders

		const q = debouncedSearch.toLowerCase().trim()

		return orders.filter(
			order =>
				order.id.toLowerCase().includes(q) ||
				order.publicId.toLowerCase().includes(q) ||
				(order.user?.email || "").toLowerCase().includes(q) ||
				(order.user?.name || "").toLowerCase().includes(q) ||
				order.bookings.some(
					booking =>
						booking.tourId.toLowerCase().includes(q) ||
						(booking.tourPublicId || "").toLowerCase().includes(q) ||
						(booking.notes || "").toLowerCase().includes(q),
				),
		)
	}, [orders, debouncedSearch])

	const filteredLeads = useMemo(() => {
		if (!debouncedSearch.trim()) return leads

		const q = debouncedSearch.toLowerCase().trim()

		return leads.filter(
			lead =>
				lead.publicId.toLowerCase().includes(q) ||
				lead.name.toLowerCase().includes(q) ||
				lead.email.toLowerCase().includes(q) ||
				(lead.phone || "").toLowerCase().includes(q),
		)
	}, [leads, debouncedSearch])

	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2 className={s.title}>Заказы туров</h2>

				{orders.length > 0 && (
					<span className={s.cardMeta}>Всего заказов: {orders.length}</span>
				)}
			</div>

			<ManagerBookingsSearch
				value={search}
				onChange={setSearch}
				placeholder="Поиск по ID заказа, клиенту или туру..."
			/>

			{isLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка заказов..." />
				</div>
			) : filteredOrders.length === 0 ? (
				<div className={s.empty}>Заказов пока нет</div>
			) : (
				<div className={s.list}>
					{filteredOrders.map(order => (
						<ManagerBookingCard key={order.id} order={order} />
					))}
				</div>
			)}

			<div className={s.header} id="guest-leads">
				<h2 className={s.title}>Guest leads по турам</h2>
				{leads.length > 0 && <span className={s.cardMeta}>Всего лидов: {leads.length}</span>}
			</div>

			{leadsLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка лидов..." />
				</div>
			) : filteredLeads.length === 0 ? (
				<div className={s.empty}>Лидов пока нет</div>
			) : (
				<div className={s.list}>
					{filteredLeads.map(lead => (
						<div key={lead.id} className={s.leadCard}>
							<div>
								<p className={s.leadId}>#{lead.publicId}</p>
								<h3 className={s.leadTitle}>{lead.name}</h3>
								<p className={s.leadMeta}>
									{lead.email}
									{lead.phone ? ` · ${lead.phone}` : ""}
								</p>
							</div>

							<div className={s.leadAside}>
								<span className={s.leadStatus} data-status={lead.status}>
									{lead.status === "new" ? "Новый lead" : "Обработан"}
								</span>
								<p className={s.leadMeta}>
									Позиций: {lead.cartSnapshot.items.length}
								</p>
								<button
									type="button"
									className={s.leadAction}
									onClick={() =>
										updateLeadStatus.mutate({
											id: lead.publicId,
											status: lead.status === "new" ? "handled" : "new",
										})
									}
									disabled={updateLeadStatus.isPending}
								>
									{lead.status === "new" ? "Отметить обработанным" : "Вернуть в new"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	)
}
