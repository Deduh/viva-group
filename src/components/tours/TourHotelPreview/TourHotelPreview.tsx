"use client"

import { getTourHotelsPreview } from "@/lib/tours"
import type { Tour } from "@/types"
import s from "./TourHotelPreview.module.scss"

interface TourHotelPreviewProps {
	tour: Pick<Tour, "hasHotelOptions" | "hotels">
}

export function TourHotelPreview({ tour }: TourHotelPreviewProps) {
	if (!tour.hasHotelOptions || !tour.hotels.length) return null

	const preview = getTourHotelsPreview(tour)

	return (
		<div className={s.wrapper}>
			<div className={s.badge}>Есть отели на выбор</div>

			<div className={s.preview}>
				{preview.map(item => (
					<span key={item} className={s.previewItem}>
						{item}
					</span>
				))}

				{tour.hotels.length > 3 && (
					<span className={s.previewCount}>
						+{tour.hotels.length - 3} еще
					</span>
				)}
			</div>
		</div>
	)
}
