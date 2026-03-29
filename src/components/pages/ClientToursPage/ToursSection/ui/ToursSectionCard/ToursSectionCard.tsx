"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { TourHotelPreview } from "@/components/tours/TourHotelPreview/TourHotelPreview"
import { useCurrency } from "@/context/CurrencyContext"
import { useTourCart } from "@/context/TourCartContext"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import {
	getPublicTourHref,
	getTourAudiencePrice,
	getTourDisplayDateRange,
} from "@/lib/tours"
import type { Tour } from "@/types"
import { CalendarDays, Moon, Sun } from "lucide-react"
import Image from "next/image"
import s from "./ToursSectionCard.module.scss"

interface ToursSectionCardProps {
	tour: Tour
	index: number
}

export function ToursSectionCard({ tour, index }: ToursSectionCardProps) {
	const { formatPrice } = useCurrency()
	const { user } = useAuth()
	const { addItem } = useTourCart()
	const { showSuccess } = useToast()
	const isAvailable = tour.available !== false
	const displayPrice = getTourAudiencePrice(tour, user?.role)
	const detailHref = getPublicTourHref(tour)
	const { dateFrom, dateTo } = getTourDisplayDateRange(tour)

	const handleAddToCart = () => {
		addItem({
			tourId: tour.id,
			tourPublicId: tour.publicId,
		})
		showSuccess("Тур добавлен в корзину.")
	}

	return (
		<article className={`${s.tourCard} ${!isAvailable ? s.tourCardUnavailable : ""}`}>
			<div className={s.cardImage}>
				<TransitionLink href={detailHref} className={s.imageLink}>
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
				</TransitionLink>
			</div>

			<div className={s.cardContent}>
				<div className={s.top}>
					<div className={s.description}>
						<div className={s.descriptionWrapper}>
							<TransitionLink href={detailHref} className={s.titleLink}>
								<h3 className={s.cardTitle}>{tour.title}</h3>
							</TransitionLink>
						</div>

						<p className={s.text}>{tour.shortDescription}</p>
					</div>

					<TourHotelPreview tour={tour} />

					<ul className={s.list}>
						{tour.tags.map((tag, tagIndex) => (
							<li key={`${tag}-${tagIndex}`} className={s.listItem}>
								{tag}
							</li>
						))}

						{dateFrom && dateTo && (
							<li className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}>
								<CalendarDays size={"1.4rem"} />
								<span>
									{formatDate(dateFrom)} - {formatDate(dateTo)}
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
						<span className={s.priceText}>
							{formatPrice(displayPrice, tour.baseCurrency)}
						</span>
					</div>

					<div className={s.bottomActions}>
						<button
							type="button"
							className={s.secondaryButton}
							onClick={handleAddToCart}
							disabled={!isAvailable}
						>
							В корзину
						</button>

						<TransitionLink href={detailHref} className={s.bottomButton}>
							Подробнее
						</TransitionLink>
					</div>
				</div>
			</div>
		</article>
	)
}
