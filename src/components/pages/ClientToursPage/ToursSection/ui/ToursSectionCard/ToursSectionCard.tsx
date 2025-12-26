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
import Link from "next/link"
import s from "./ToursSectionCard.module.scss"

interface ToursSectionCardProps {
	tour: Tour
	index: number
}

export function ToursSectionCard({ tour, index }: ToursSectionCardProps) {
	const isAvailable = tour.available !== false

	return (
		<Link
			href={`/client/tours/tour/${tour.id}`}
			className={`${s.tourCard} ${!isAvailable ? s.tourCardUnavailable : ""}`}
		>
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
					<div className={s.description}>
						<div className={s.descriptionWrapper}>
							<h3 className={s.cardTitle}>{tour.destination}</h3>

							{tour.rating && (
								<div className={s.rating}>
									<Star size={16} color="rgba(234, 179, 8, 1)" />
									<span className={s.ratingNum}>{tour.rating.toFixed(1)}</span>
								</div>
							)}
						</div>

						<p className={s.text}>{tour.shortDescription}</p>
					</div>

					<ul className={s.list}>
						{tour.properties.map((property, index) => (
							<li key={index} className={s.listItem}>
								{property}
							</li>
						))}
					</ul>
				</div>

				<div className={s.bottom}>
					<div className={s.price}>
						<span className={s.pricePlaceholder}>Цена за человека</span>

						<span className={s.priceText}>{formatCurrency(tour.price)}</span>
					</div>

					<button className={s.bottomButton}>Подробнее</button>
				</div>
			</div>
		</Link>
	)
}
