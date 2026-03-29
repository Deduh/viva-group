"use client"

import { parseTourProgram } from "@/lib/tour-program"
import type { Tour } from "@/types"
import { MapPinned } from "lucide-react"
import s from "./TourProgramSection.module.scss"

interface TourProgramSectionProps {
	tour: Pick<Tour, "programText" | "fullDescriptionBlocks">
}

export function TourProgramSection({ tour }: TourProgramSectionProps) {
	const parsed = parseTourProgram(tour.programText, tour.fullDescriptionBlocks)

	if (!parsed.hasStructuredDays && parsed.fallbackSections.length === 0) {
		return null
	}

	return (
		<section className={s.section}>
			<div className={s.header}>
				<span className={s.iconWrap}>
					<MapPinned size={"1.8rem"} />
				</span>

				<div>
					<h2 className={s.title}>Программа тура</h2>
					<p className={s.text}>Маршрут Вашей поездки по дням.</p>
				</div>
			</div>

			{parsed.hasStructuredDays ? (
				<div className={s.daysGrid}>
					{parsed.days.map(day => (
						<article key={day.id} className={s.dayCard}>
							<div className={s.dayTop}>
								<h3 className={s.dayTitle}>{day.title}</h3>
								{day.subtitle && (
									<p className={s.daySubtitle}>{day.subtitle}</p>
								)}
							</div>

							<ul className={s.items}>
								{day.items.map(item => (
									<li key={item} className={s.item}>
										{item}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			) : (
				<div className={s.fallbackList}>
					{parsed.fallbackSections.map(section => (
						<article key={section.id} className={s.fallbackCard}>
							{section.title && (
								<h3 className={s.fallbackTitle}>{section.title}</h3>
							)}

							<ul className={s.items}>
								{section.items.map(item => (
									<li key={item} className={s.item}>
										{item}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			)}
		</section>
	)
}
