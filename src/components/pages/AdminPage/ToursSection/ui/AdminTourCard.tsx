"use client"

import { formatCurrency } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import type { Tour } from "@/types"
import { Star } from "lucide-react"
import Image from "next/image"
import s from "./AdminTourCard.module.scss"

interface AdminTourCardProps {
	tour: Tour
	index: number
	onEdit: () => void
	onDelete: () => void
}

export function AdminTourCard({
	tour,
	index,
	onEdit,
	onDelete,
}: AdminTourCardProps) {
	return (
		<div className={s.tourCard}>
			<div className={s.cardImage}>
				<Image
					src={tour.image}
					alt={getTourImageAlt(tour.destination)}
					fill
					sizes={getImageSizes({
						mobile: "100vw",
						tablet: "50vw",
						desktop: "33vw",
					})}
					priority={shouldUsePriority(index)}
					placeholder="blur"
					blurDataURL={BLUR_PLACEHOLDER}
				/>
			</div>

			<div className={s.cardContent}>
				<div className={s.top}>
					<div className={s.descriptionWrapper}>
						<h3 className={s.cardTitle}>{tour.destination}</h3>

						{tour.rating !== undefined && (
							<div className={s.rating}>
								<Star size={16} color="rgba(234, 179, 8, 1)" />
								<span className={s.ratingNum}>{tour.rating.toFixed(1)}</span>
							</div>
						)}
					</div>

					<p className={s.text}>{tour.shortDescription}</p>
				</div>

				{tour.properties.length > 0 && (
					<ul className={s.list}>
						{tour.properties.map((property, propertyIndex) => (
							<li key={`${property}-${propertyIndex}`} className={s.listItem}>
								{property}
							</li>
						))}
					</ul>
				)}

				<div className={s.bottom}>
					<div className={s.price}>
						<span className={s.pricePlaceholder}>Цена за человека</span>

						<span className={s.priceText}>{formatCurrency(tour.price)}</span>
					</div>

					<div className={s.actions}>
						<button className={s.secondary} onClick={onEdit} type="button">
							Редактировать
						</button>

						<button className={s.danger} onClick={onDelete} type="button">
							Удалить
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
