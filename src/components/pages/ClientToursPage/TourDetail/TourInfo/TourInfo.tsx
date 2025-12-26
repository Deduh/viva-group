"use client"

import { formatCurrency } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getDetailPageImageSizes,
	getTourImageAlt,
} from "@/lib/image-utils"
import type { Tour } from "@/types"
import { Star } from "lucide-react"
import Image from "next/image"
import s from "./TourInfo.module.scss"

interface TourInfoProps {
	tour: Tour
}

export function TourInfo({ tour }: TourInfoProps) {
	return (
		<div className={s.tourInfo}>
			<div className={s.imageWrapper}>
				<Image
					src={tour.image}
					alt={getTourImageAlt(tour.destination, tour.shortDescription)}
					fill
					sizes={getDetailPageImageSizes()}
					priority
					placeholder="blur"
					blurDataURL={BLUR_PLACEHOLDER}
					className={s.image}
				/>
			</div>

			<div className={s.tourDetails}>
				<div className={s.header}>
					<h1 className={s.title}>{tour.destination}</h1>

					{tour.rating && (
						<div className={s.rating}>
							<Star size={20} color="rgba(234, 179, 8, 1)" />

							<span className={s.ratingNum}>{tour.rating.toFixed(1)}</span>
						</div>
					)}
				</div>

				<p className={s.description}>{tour.shortDescription}</p>

				{tour.fullDescription && (
					<p className={s.fullDescription}>{tour.fullDescription}</p>
				)}

				<div className={s.priceInfo}>
					<span className={s.priceLabel}>Цена за человека:</span>

					<span className={s.priceValue}>{formatCurrency(tour.price)}</span>
				</div>

				{tour.properties && tour.properties.length > 0 && (
					<div className={s.properties}>
						<h3 className={s.propertiesTitle}>Что включено:</h3>

						<ul className={s.propertiesList}>
							{tour.properties.map((property, index) => (
								<li key={index} className={s.propertyItem}>
									{property}
								</li>
							))}
						</ul>
					</div>
				)}

				{tour.duration && (
					<div className={s.meta}>
						<span className={s.metaLabel}>Длительность:</span>

						<span className={s.metaValue}>{tour.duration} дней</span>
					</div>
				)}
			</div>
		</div>
	)
}
