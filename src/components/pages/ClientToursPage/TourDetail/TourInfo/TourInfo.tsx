"use client"

import { TourHotelOptionsSection } from "@/components/tours/TourHotelOptionsSection/TourHotelOptionsSection"
import { TourProgramSection } from "@/components/tours/TourProgramSection/TourProgramSection"
import { useCurrency } from "@/context/CurrencyContext"
import { useAuth } from "@/hooks/useAuth"
import { formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getDetailPageImageSizes,
	getTourImageAlt,
} from "@/lib/image-utils"
import { getTourAudiencePrice, getTourDisplayDateRange } from "@/lib/tours"
import type { Tour } from "@/types"
import { CalendarDays, Moon, Sun } from "lucide-react"
import Image from "next/image"
import s from "./TourInfo.module.scss"

interface TourInfoProps {
	tour: Tour
}

export function TourInfo({ tour }: TourInfoProps) {
	const { formatPrice } = useCurrency()
	const { user } = useAuth()
	const displayPrice = getTourAudiencePrice(tour, user?.role)
	const { dateFrom, dateTo } = getTourDisplayDateRange(tour)

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

				<p className={s.lead}>{tour.shortDescription}</p>

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
					{dateFrom && dateTo && (
						<div className={`${s.metaBadge} ${s.metaBadgeDate}`}>
							<CalendarDays size={"1.8rem"} />
							<span>
								{formatDate(dateFrom)} - {formatDate(dateTo)}
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

				<div className={s.programPriceCard}>
					<span className={s.programPriceLabel}>Базовая цена программы</span>
					<span className={s.programPriceValue}>
						{formatPrice(displayPrice, tour.baseCurrency)}
					</span>
					<p className={s.programPriceHint}>
						Отели выбираются в корзине и считаются отдельной доплатой к
						программе.
					</p>
				</div>

				<div className={s.sections}>
					<TourProgramSection tour={tour} />
					<TourHotelOptionsSection tour={tour} />
				</div>

				{!tour.programText &&
					!tour.hasHotelOptions &&
					tour.fullDescriptionBlocks.length > 0 && (
						<div className={s.properties}>
							{tour.fullDescriptionBlocks.map((block, index) => (
								<div
									key={`${block.title}-${index}`}
									className={s.propertyBlock}
								>
									<h3 className={s.propertiesTitle}>{block.title}</h3>

									<ul className={s.propertiesList}>
										{block.items.map((item, itemIndex) => (
											<li
												key={`${item}-${itemIndex}`}
												className={s.propertyItem}
											>
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
