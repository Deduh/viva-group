"use client"

import { BookingForm } from "@/components/forms/BookingForm/BookingForm"
import { PriceCalculation } from "@/components/pages/ClientToursPage/TourDetail"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import { getPublicTourHref } from "@/lib/tours"
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
	const [partySize, setPartySize] = useState(1)
	const callbackUrl = pathname || getPublicTourHref(tour)
	const canBookAsTraveler = user?.role === "CLIENT" || user?.role === "AGENT"

	return (
		<div className={s.wrapper}>
			{isLoading ? (
				<div className={s.infoCard}>
					<h2 className={s.title}>Проверяем доступ</h2>
					<p className={s.text}>Подготавливаем форму бронирования тура.</p>
				</div>
			) : !user ? (
				<div className={s.infoCard}>
					<h2 className={s.title}>Бронирование доступно после входа</h2>
					<p className={s.text}>
						Сначала ознакомьтесь с программой и отелями, затем войдите в аккаунт
						и отправьте заявку на бронирование.
					</p>

					<div className={s.actions}>
						<TransitionLink
							href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
							className={s.primary}
						>
							Войти
						</TransitionLink>

						<TransitionLink
							href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
							className={s.secondary}
						>
							Зарегистрироваться
						</TransitionLink>
					</div>
				</div>
			) : canBookAsTraveler ? (
				<>
					<BookingForm
						tourId={tour.publicId ?? tour.id}
						onPartySizeChange={setPartySize}
						isAvailable={tour.available}
					/>

					<PriceCalculation
						partySize={partySize}
						pricePerPerson={tour.price}
						baseCurrency={tour.baseCurrency}
					/>
				</>
			) : (
				<div className={s.infoCard}>
					<h2 className={s.title}>Управление турами доступно из кабинета</h2>
					<p className={s.text}>
						Для бронирования используйте клиентский или агентский аккаунт. Ваша
						текущая роль открывает раздел управления.
					</p>

					<TransitionLink href="/manager/tours" className={s.primary}>
						Открыть кабинет
					</TransitionLink>
				</div>
			)}
		</div>
	)
}
