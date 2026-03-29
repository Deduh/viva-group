"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import {
	getTourAudiencePrice,
	getTourDisplayDateRange,
	getTourPrimaryDeparture,
} from "@/lib/tours"
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
	const { formatPrice } = useCurrency()
	const { dateFrom, dateTo } = getTourDisplayDateRange(tour)
	const displayPrice = getTourAudiencePrice(tour)
	const primaryDeparture = getTourPrimaryDeparture(tour)

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
					(dateFrom && dateTo) ||
					tour.durationDays ||
					tour.durationNights ||
					primaryDeparture?.label) && (
					<ul className={s.list}>
						{tour.tags.map((tag, tagIndex) => (
							<li key={`${tag}-${tagIndex}`} className={s.listItem}>
								{tag}
							</li>
						))}

						{dateFrom && dateTo && (
							<li className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}>
								<CalendarDays size={"1.6rem"} />
								<span>
									{formatDate(dateFrom)} - {formatDate(dateTo)}
								</span>
							</li>
						)}

						{primaryDeparture?.label && (
							<li className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}>
								<CalendarDays size={"1.6rem"} />
								<span>{primaryDeparture.label}</span>
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
						<span className={s.pricePlaceholder}>Цена B2C</span>

						<span className={s.priceText}>
							{formatPrice(displayPrice, tour.baseCurrency)}
						</span>

						{typeof primaryDeparture?.agentPrice === "number" ? (
							<div className={s.agentPrice}>
								<span className={s.agentPriceLabel}>Цена B2B</span>
								<span className={s.agentPriceValue}>
									{formatPrice(primaryDeparture.agentPrice, tour.baseCurrency)}
								</span>
							</div>
						) : typeof tour.agentPrice === "number" ? (
							<div className={s.agentPrice}>
								<span className={s.agentPriceLabel}>Цена B2B</span>
								<span className={s.agentPriceValue}>
									{formatPrice(tour.agentPrice, tour.baseCurrency)}
								</span>
							</div>
						) : null}
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
