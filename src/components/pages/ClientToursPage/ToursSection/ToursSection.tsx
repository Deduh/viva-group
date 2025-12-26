"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import type { Tour } from "@/types"
import s from "./ToursSection.module.scss"
import { ToursSectionCard } from "./ui/ToursSectionCard/ToursSectionCard"

interface ToursSectionProps {
	tours: Tour[]
	isLoading: boolean
}

export function ToursSection({ tours, isLoading }: ToursSectionProps) {
	return (
		<section className={s.section}>
			<h2 className={s.title}>Все туры</h2>

			{isLoading ? (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка туров..." />
				</div>
			) : tours.length === 0 ? (
				<div className={s.empty}>
					<p className={s.emptyText}>Туры не найдены</p>
				</div>
			) : (
				<div className={s.toursGrid}>
					{tours.map((tour, index) => (
						<ToursSectionCard key={tour.id} tour={tour} index={index} />
					))}
				</div>
			)}
		</section>
	)
}
