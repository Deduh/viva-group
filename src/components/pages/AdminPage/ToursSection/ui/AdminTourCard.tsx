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
					<div className={s.descriptionWrapper}>
						<h3 className={s.cardTitle}>{tour.title}</h3>
					</div>

					<p className={s.text}>{tour.shortDescription}</p>
				</div>

				{(tour.tags.length > 0 ||
					(tour.dateFrom && tour.dateTo) ||
					tour.durationDays ||
					tour.durationNights) && (
					<ul className={s.list}>
						{tour.tags.map((tag, tagIndex) => (
							<li key={`${tag}-${tagIndex}`} className={s.listItem}>
								{tag}
							</li>
						))}

						{tour.dateFrom && tour.dateTo && (
							<li className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}>
								<CalendarDays size={"1.6rem"} />

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
									<Sun size={"1.4rem"} />

									<Moon size={"1.4rem"} />
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
