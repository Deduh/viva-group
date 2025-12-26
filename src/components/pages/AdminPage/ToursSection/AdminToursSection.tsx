"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import type { Tour } from "@/types"
import s from "./AdminToursSection.module.scss"
import { AdminTourCard } from "./ui/AdminTourCard"

interface AdminToursSectionProps {
	tours: Tour[]
	isLoading: boolean
	onAdd: () => void
	onEdit: (tour: Tour) => void
	onDelete: (tour: Tour) => void
}

export function AdminToursSection({
	tours,
	isLoading,
	onAdd,
	onEdit,
	onDelete,
}: AdminToursSectionProps) {
	return (
		<section className={s.section}>
			<div className={s.header}>
				<h2>Все туры</h2>

				<button className={s.addButton} onClick={onAdd} type="button">
					Добавить тур
				</button>
			</div>

			{isLoading ? (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка туров..." />
				</div>
			) : tours.length === 0 ? (
				<div className={s.empty}>Туры не найдены</div>
			) : (
				<div className={s.grid}>
					{tours.map((tour, index) => (
						<AdminTourCard
							key={tour.id}
							tour={tour}
							index={index}
							onEdit={() => onEdit(tour)}
							onDelete={() => onDelete(tour)}
						/>
					))}
				</div>
			)}
		</section>
	)
}
