"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import {
	useCreateCharterFlight,
	useUpdateCharterFlight,
} from "@/hooks/useCharterFlightMutations"
import { useCharterFlightsAdmin } from "@/hooks/useCharterFlightsAdmin"
import type { CharterFlightCreateInput } from "@/lib/validation"
import type { CharterFlight } from "@/types"
import { useMemo, useState } from "react"
import s from "./ManagerCharterFlightsSection.module.scss"
import { CharterFlightFormModal } from "./ui/CharterFlightFormModal/CharterFlightFormModal"
import { ManagerCharterFlightCard } from "./ui/ManagerCharterFlightCard/ManagerCharterFlightCard"

type FlightsTab = "active" | "archive"

export function ManagerCharterFlightsSection() {
	const createFlight = useCreateCharterFlight()
	const updateFlight = useUpdateCharterFlight()

	const [tab, setTab] = useState<FlightsTab>("active")
	const queryFilters = useMemo(() => {
		return { isActive: tab === "active" }
	}, [tab])
	const { flights, isLoading, error } = useCharterFlightsAdmin(queryFilters)

	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [editingFlight, setEditingFlight] = useState<CharterFlight | null>(null)

	const handleCreate = async (data: CharterFlightCreateInput) => {
		await createFlight.mutateAsync(data)

		setIsCreateOpen(false)
	}

	const handleUpdate = async (data: CharterFlightCreateInput) => {
		if (!editingFlight) return

		await updateFlight.mutateAsync({ id: editingFlight.id, data })

		setEditingFlight(null)
	}

	const handleArchiveToggle = async (
		flight: CharterFlight,
		isActive: boolean,
	) => {
		await updateFlight.mutateAsync({ id: flight.id, data: { isActive } })
	}

	return (
		<section className={s.section}>
			<div className={s.header}>
				<div className={s.headerLeft}>
					<h2 className={s.title}>Рейсы</h2>

					<div className={s.tabs} role="tablist" aria-label="Фильтр рейсов">
						<button
							type="button"
							role="tab"
							aria-selected={tab === "active"}
							className={`${s.tab} ${tab === "active" ? s.tabActive : ""}`}
							onClick={() => setTab("active")}
						>
							Активные
						</button>

						<button
							type="button"
							role="tab"
							aria-selected={tab === "archive"}
							className={`${s.tab} ${tab === "archive" ? s.tabActive : ""}`}
							onClick={() => setTab("archive")}
						>
							Архив
						</button>
					</div>
				</div>

				{/* // TODO: Вынести одинаковые кнопки в отдельный компонент */}
				<button
					type="button"
					className={s.addButton}
					onClick={() => setIsCreateOpen(true)}
				>
					Создать рейс
				</button>
			</div>

			{error ? (
				<div className={s.empty}>
					<p className={s.emptyText}>
						Ошибка загрузки рейсов:{" "}
						{error instanceof Error ? error.message : "Неизвестная ошибка"}
					</p>
				</div>
			) : isLoading ? (
				<div className={s.empty}>
					<LoadingSpinner text="Загрузка рейсов..." />
				</div>
			) : flights.length === 0 ? (
				<div className={s.empty}>
					<p className={s.emptyText}>
						{tab === "active" ? "Активных рейсов пока нет" : "Архив пуст"}
					</p>
				</div>
			) : (
				<div className={s.list}>
					{flights.map(flight => (
						<ManagerCharterFlightCard
							key={flight.id}
							flight={flight}
							onArchive={() => handleArchiveToggle(flight, false)}
							onRestore={() => handleArchiveToggle(flight, true)}
							onEdit={() => setEditingFlight(flight)}
						/>
					))}
				</div>
			)}

			<CharterFlightFormModal
				isOpen={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				onSubmit={handleCreate}
			/>

			<CharterFlightFormModal
				isOpen={Boolean(editingFlight)}
				onClose={() => setEditingFlight(null)}
				flight={editingFlight}
				onSubmit={handleUpdate}
			/>
		</section>
	)
}
