"use client"

import { formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getDetailPageImageSizes,
	getTourImageAlt,
} from "@/lib/image-utils"
import type { Tour } from "@/types"
import { CalendarDays, Moon, Sun } from "lucide-react"
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
					alt={getTourImageAlt(tour.title, tour.shortDescription)}
					fill
					sizes={getDetailPageImageSizes()}
					priority
					placeholder="blur"
					blurDataURL={BLUR_PLACEHOLDER}
					className={s.image}
				/>
			</div>

			<div className={s.tourDetails}>
				<h1 className={s.title}>{tour.title}</h1>

				{tour.tags.length > 0 && (
					<ul className={s.tagsList}>
						{tour.tags.map((tag, index) => (
							<li key={`${tag}-${index}`} className={s.tagBadge}>
								{tag}
							</li>
						))}
					</ul>
				)}

				<div className={s.metaBadges}>
					{tour.dateFrom && tour.dateTo && (
						<div className={`${s.metaBadge} ${s.metaBadgeDate}`}>
							<CalendarDays size={"1.8rem"} />

							<span>
								{formatDate(tour.dateFrom)} — {formatDate(tour.dateTo)}
							</span>
						</div>
					)}

					{(tour.durationDays || tour.durationNights) && (
						<div className={`${s.metaBadge} ${s.metaBadgeDuration}`}>
							<div className={s.metaIconGroup}>
								<Sun size={"1.6rem"} />

								<Moon size={"1.6rem"} />
							</div>

							<span>
								{[
									tour.durationDays ? `${tour.durationDays} дн.` : null,
									tour.durationNights ? `${tour.durationNights} ноч.` : null,
								]
									.filter(Boolean)
									.join(" / ")}
							</span>
						</div>
					)}
				</div>

				{tour.fullDescriptionBlocks.length > 0 && (
					<div className={s.properties}>
						{tour.fullDescriptionBlocks.map((block, index) => (
							<div key={`${block.title}-${index}`} className={s.propertyBlock}>
								<h3 className={s.propertiesTitle}>{block.title}</h3>

								<ul className={s.propertiesList}>
									{block.items.map((item, itemIndex) => (
										<li key={`${item}-${itemIndex}`} className={s.propertyItem}>
											{item}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
