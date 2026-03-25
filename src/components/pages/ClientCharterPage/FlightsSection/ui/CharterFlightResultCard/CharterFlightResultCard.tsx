"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { formatCharterWeekDays } from "@/lib/charter-week-days"
import { formatDate } from "@/lib/format"
import type { CharterFlight } from "@/types"
import {
	CalendarDays,
	ListChecks,
	MapPin,
	PlaneTakeoff,
	Users,
} from "lucide-react"
import s from "./CharterFlightResultCard.module.scss"

interface CharterFlightResultCardProps {
	flight: CharterFlight
	onBook: () => void
	isBooking?: boolean
	showPricing?: boolean
}

export function CharterFlightResultCard({
	flight,
	onBook,
	isBooking = false,
	showPricing = false,
}: CharterFlightResultCardProps) {
	const { formatPrice } = useCurrency()
	const classes = [
		flight.hasBusinessClass ? "Business" : null,
		flight.hasComfortClass ? "Comfort" : null,
	]
		.filter(Boolean)
		.join(" / ")

	return (
		<div className={s.card}>
			<div className={s.header}>
				<p className={s.id}>#{flight.publicId}</p>

				<span className={s.badge}>
					<PlaneTakeoff size={"1.4rem"} />
					Рейс
				</span>
			</div>

			<div className={s.route}>
				<MapPin size={"1.8rem"} className={s.icon} />

				<span>
					{flight.from} → {flight.to}
				</span>
			</div>

			<div className={s.meta}>
				<div className={s.metaItem}>
					<CalendarDays size={"1.6rem"} />

					<span>
						{formatDate(flight.dateFrom)} - {formatDate(flight.dateTo)}
					</span>
				</div>

				<div className={s.metaItem}>
					<ListChecks size={"1.6rem"} />

					<span>{formatCharterWeekDays(flight.weekDays)}</span>
				</div>

				<div className={s.metaItem}>
					<Users size={"1.6rem"} />

					<span>Мест на вылет: {flight.seatsTotal}</span>
				</div>
			</div>

			<div className={s.tags}>
				{classes && <span className={s.classTag}>{classes}</span>}

				{flight.categories.slice(0, 4).map(category => (
					<span key={category} className={s.tag}>
						{category}
					</span>
				))}

				{flight.categories.length > 4 && (
					<span className={s.tag}>+{flight.categories.length - 4}</span>
				)}
			</div>

			{showPricing &&
				(flight.agentPrice || flight.price || flight.agentCommission) && (
					<div className={s.pricing}>
						{flight.agentPrice ? (
							<div className={s.priceCard}>
								<span className={s.priceLabel}>Цена для агентства</span>
								<strong className={s.priceValue}>
									{formatPrice(
										flight.agentPrice,
										flight.priceCurrency ?? "RUB",
									)}
								</strong>
							</div>
						) : null}

						{flight.price ? (
							<div className={s.priceCard}>
								<span className={s.priceLabel}>Публичная цена</span>
								<strong className={s.priceValue}>
									{formatPrice(flight.price, flight.priceCurrency ?? "RUB")}
								</strong>
							</div>
						) : null}

						{typeof flight.agentCommission === "number" ? (
							<div className={s.priceCard}>
								<span className={s.priceLabel}>Комиссия</span>
								<strong className={s.priceValue}>
									{formatPrice(
										flight.agentCommission,
										flight.priceCurrency ?? "RUB",
									)}
								</strong>
							</div>
						) : null}
					</div>
				)}

			<div className={s.actions}>
				<button
					type="button"
					className={s.primary}
					onClick={onBook}
					disabled={isBooking}
				>
					{isBooking ? "Бронируем..." : "Забронировать"}
				</button>
			</div>
		</div>
	)
}
