"use client"

import { PriceCalculation } from "@/components/pages/ClientToursPage/TourDetail"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useTourCart } from "@/context/TourCartContext"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { getPublicTourHref, getTourAudiencePrice } from "@/lib/tours"
import type { Tour } from "@/types"
import { usePathname } from "next/navigation"
import { useState } from "react"
import s from "./TourBookingPanel.module.scss"

interface TourBookingPanelProps {
	tour: Tour
}

export function TourBookingPanel({ tour }: TourBookingPanelProps) {
	const pathname = usePathname()
	const { user, isLoading } = useAuth()
	const { addItem } = useTourCart()
	const { showSuccess } = useToast()
	const [partySize, setPartySize] = useState(1)

	const callbackUrl = pathname || getPublicTourHref(tour)
	const canBookAsTraveler = user?.role === "CLIENT" || user?.role === "AGENT"

	const handleAddToCart = () => {
		addItem({
			tourId: tour.id,
			tourPublicId: tour.publicId,
			participantsCount: partySize,
		})
		showSuccess("Тур добавлен в корзину.")
	}

	return (
		<div className={s.wrapper}>
			<div className={s.infoCard}>
				<h2 className={s.title}>Cart-first бронирование</h2>
				<p className={s.text}>
					Добавьте программу в корзину, затем в checkout выберите отель как
					отдельную доплату по каждому участнику и заполните паспортные данные.
				</p>

				<label className={s.counterField}>
					<span>Количество участников</span>
					<input
						type="number"
						min="1"
						value={partySize}
						disabled={isLoading || tour.available === false}
						onChange={event => setPartySize(Math.max(1, Number(event.target.value) || 1))}
					/>
				</label>

				<div className={s.actions}>
					<button
						type="button"
						className={s.primary}
						onClick={handleAddToCart}
						disabled={isLoading || tour.available === false}
					>
						Добавить в корзину
					</button>

					<TransitionLink href="/cart" className={s.secondary}>
						Открыть корзину
					</TransitionLink>
				</div>

				{!isLoading && !user && (
					<div className={s.authBox}>
						<p className={s.authText}>
							Без входа можно отправить быстрый lead. Для полноценного заказа
							система попросит войти и вернет вас прямо в корзину.
						</p>

						<div className={s.actions}>
							<TransitionLink
								href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
								className={s.secondary}
							>
								Войти
							</TransitionLink>

							<TransitionLink
								href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
								className={s.secondary}
							>
								Регистрация
							</TransitionLink>
						</div>
					</div>
				)}

				{!isLoading && canBookAsTraveler && (
					<p className={s.helper}>
						{user?.role === "AGENT"
							? "В checkout будут применены агентские B2B цены."
							: "В checkout будут применены клиентские B2C цены."}
					</p>
				)}
			</div>

			<PriceCalculation
				partySize={partySize}
				pricePerPerson={getTourAudiencePrice(tour, user?.role)}
				baseCurrency={tour.baseCurrency}
			/>
		</div>
	)
}
