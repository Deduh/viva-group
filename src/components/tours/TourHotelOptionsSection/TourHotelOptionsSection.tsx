"use client"

import { useCurrency } from "@/context/CurrencyContext"
import type { Tour } from "@/types"
import { Building2, MessageCircleMore, Star } from "lucide-react"
import s from "./TourHotelOptionsSection.module.scss"

interface TourHotelOptionsSectionProps {
	tour: Pick<Tour, "hasHotelOptions" | "hotels">
}

export function TourHotelOptionsSection({
	tour,
}: TourHotelOptionsSectionProps) {
	const { formatPrice } = useCurrency()

	if (!tour.hasHotelOptions || !tour.hotels.length) return null

	return (
		<section className={s.section}>
			<div className={s.header}>
				<div>
					<span className={s.eyebrow}>Есть отели на выбор</span>
					<h2 className={s.title}>Отели по программе</h2>
				</div>

				<p className={s.note}>
					Отель не выбирается в форме бронирования. После заявки менеджер
					подтвердит подходящий вариант в чате.
				</p>
			</div>

			<div className={s.grid}>
				{tour.hotels.map(hotel => (
					<article key={`${hotel.name}-${hotel.stars}`} className={s.card}>
						<div className={s.cardTop}>
							<div className={s.hotelHead}>
								<span className={s.hotelIcon}>
									<Building2 size={"1.7rem"} />
								</span>

								<div>
									<h3 className={s.hotelName}>{hotel.name}</h3>

									<div className={s.stars}>
										{Array.from({ length: hotel.stars }, (_, index) => (
											<Star
												key={`${hotel.name}-star-${index + 1}`}
												size={"1.4rem"}
												fill="currentColor"
											/>
										))}
									</div>
								</div>
							</div>

							<div className={s.priceWrap}>
								<span className={s.priceLabel}>Цена за человека</span>
								<span className={s.price}>
									{formatPrice(hotel.basePrice, hotel.baseCurrency)}
								</span>
							</div>
						</div>

						{hotel.note && <p className={s.hotelNote}>{hotel.note}</p>}

						<div className={s.cardFooter}>
							<MessageCircleMore size={"1.4rem"} />
							<span>Финальный выбор и подтверждение отеля идут в переписке</span>
						</div>
					</article>
				))}
			</div>
		</section>
	)
}
