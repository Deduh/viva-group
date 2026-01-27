"use client"

import { formatCurrency, formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import type { Tour } from "@/types"
import { CalendarDays, Moon, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import s from "./ToursSectionCard.module.scss"

interface ToursSectionCardProps {
	tour: Tour
	index: number
}

export function ToursSectionCard({ tour, index }: ToursSectionCardProps) {
	const isAvailable = tour.available !== false
	const tourSlug = tour.publicId ?? tour.id

	return (
		<Link
			href={`/client/tours/tour/${tourSlug}`}
			className={`${s.tourCard} ${!isAvailable ? s.tourCardUnavailable : ""}`}
		>
			<div className={s.cardImage}>
				<Image
					src={tour.image}
					alt={getTourImageAlt(tour.title)}
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
							<h3 className={s.cardTitle}>{tour.title}</h3>
						</div>

						<p className={s.text}>{tour.shortDescription}</p>
					</div>

					<ul className={s.list}>
						{tour.tags.map((tag, index) => (
							<li key={`${tag}-${index}`} className={s.listItem}>
								{tag}
							</li>
						))}

						{tour.dateFrom && tour.dateTo && (
							<li className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}>
								<CalendarDays size={"1.4rem"} />
								<span>
									{formatDate(tour.dateFrom)} — {formatDate(tour.dateTo)}
								</span>
							</li>
						)}

						{(tour.durationDays || tour.durationNights) && (
							<li
								className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDuration}`}
							>
								<span className={s.metaIconGroup}>
									<Sun size={"1.2rem"} />

									<Moon size={"1.2rem"} />
								</span>

								<span>
									{[
										tour.durationDays ? `${tour.durationDays} дн.` : null,
										tour.durationNights ? `${tour.durationNights} ноч.` : null,
									]
										.filter(Boolean)
										.join(" / ")}
								</span>
							</li>
						)}
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
