"use client"

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
import s from "./ManagerCharterFlightCard.module.scss"

interface ManagerCharterFlightCardProps {
	flight: CharterFlight
	onArchive: () => void
	onRestore: () => void
	onEdit: () => void
}

export function ManagerCharterFlightCard({
	flight,
	onArchive,
	onRestore,
	onEdit,
}: ManagerCharterFlightCardProps) {
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
				<div className={s.headerBadges}>
					<span className={s.routeBadge}>
						<PlaneTakeoff size={"1.4rem"} />
						Рейс
					</span>

					<span
						className={`${s.stateBadge} ${
							flight.isActive ? s.stateActive : s.stateArchived
						}`}
					>
						{flight.isActive ? "Активен" : "В архиве"}
					</span>
				</div>
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

					<span>Мест: {flight.seatsTotal}</span>
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

			<div className={s.actions}>
				<button type="button" className={s.secondary} onClick={onEdit}>
					Редактировать
				</button>

				{flight.isActive ? (
					<button type="button" className={s.danger} onClick={onArchive}>
						Архивировать
					</button>
				) : (
					<button type="button" className={s.primary} onClick={onRestore}>
						Восстановить
					</button>
				)}
			</div>
		</div>
	)
}
