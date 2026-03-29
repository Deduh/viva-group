"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { useAuth } from "@/hooks/useAuth"
import { getTourHotelAudienceSupplement } from "@/lib/tours"
import type { Tour } from "@/types"
import { Building2, Check, MessageCircleMore, Star } from "lucide-react"
import s from "./TourHotelOptionsSection.module.scss"

interface TourHotelOptionsSectionProps {
	tour: Pick<Tour, "hasHotelOptions" | "hotels">
	selectedHotelId?: string
	onSelectHotel?: (hotelId: string) => void
	title?: string
	note?: string
}

export function TourHotelOptionsSection({
	tour,
	selectedHotelId,
	onSelectHotel,
	title = "Отели по программе",
	note = "Отель выбирается в корзине по каждому участнику. Ниже показана именно доплата к базовой программе, а не замена цены тура.",
}: TourHotelOptionsSectionProps) {
	const { formatPrice } = useCurrency()
	const { user } = useAuth()
	const isInteractive = typeof onSelectHotel === "function"

	if (!tour.hasHotelOptions || !tour.hotels.length) return null

	return (
		<section className={s.section}>
			<div className={s.header}>
				<div>
					<span className={s.eyebrow}>Есть отели на выбор</span>
					<h2 className={s.title}>{title}</h2>
				</div>

				<p className={s.note}>{note}</p>
			</div>

			<div className={s.grid}>
				{tour.hotels.map(hotel => {
					const isSelected = selectedHotelId === hotel.id
					const cardClassName = `${s.card} ${isInteractive ? s.cardInteractive : ""} ${isSelected ? s.cardSelected : ""}`

					if (isInteractive) {
						return (
							<button
								key={hotel.id}
								type="button"
								className={cardClassName}
								onClick={() => onSelectHotel(hotel.id)}
								aria-pressed={isSelected}
							>
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
														key={`${hotel.id}-star-${index + 1}`}
														size={"1.4rem"}
														fill="currentColor"
													/>
												))}
											</div>
										</div>
									</div>

									<div className={s.priceWrap}>
										<span className={s.priceLabel}>Доплата за человека</span>
										<span className={s.price}>
											{formatPrice(
												getTourHotelAudienceSupplement(hotel, user?.role),
												hotel.baseCurrency,
											)}
										</span>
									</div>
								</div>

								{hotel.note && <p className={s.hotelNote}>{hotel.note}</p>}

								<div className={s.cardFooter}>
									{isSelected ? (
										<>
											<Check size={"1.4rem"} />
											<span>Отель выбран для этой позиции</span>
										</>
									) : (
										<>
											<MessageCircleMore size={"1.4rem"} />
											<span>Нажмите на карточку, чтобы выбрать отель</span>
										</>
									)}
								</div>
							</button>
						)
					}

					return (
						<article key={hotel.id} className={cardClassName}>
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
													key={`${hotel.id}-star-${index + 1}`}
													size={"1.4rem"}
													fill="currentColor"
												/>
											))}
										</div>
									</div>
								</div>

								<div className={s.priceWrap}>
									<span className={s.priceLabel}>Доплата за человека</span>
									<span className={s.price}>
										{formatPrice(
											getTourHotelAudienceSupplement(hotel, user?.role),
											hotel.baseCurrency,
										)}
									</span>
								</div>
							</div>

							{hotel.note && <p className={s.hotelNote}>{hotel.note}</p>}

							<div className={s.cardFooter}>
								<MessageCircleMore size={"1.4rem"} />
								<span>Финальный выбор отеля фиксируется при checkout</span>
							</div>
						</article>
					)
				})}
			</div>
		</section>
	)
}
