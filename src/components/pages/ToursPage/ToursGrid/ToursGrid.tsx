"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/format"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import type { Tour } from "@/types"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CalendarDays, Moon, Sun } from "lucide-react"
import Image from "next/image"
import { memo, useRef } from "react"
import s from "./ToursGrid.module.scss"

gsap.registerPlugin(ScrollTrigger)

interface ToursGridProps {
	tours: Tour[]
	isLoading?: boolean
}

export const ToursGrid = memo(
	function ToursGrid({ tours, isLoading = false }: ToursGridProps) {
		const gridRef = useRef<HTMLDivElement>(null)
		const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()

		const dashboardHref = (() => {
			if (!isAuthLoading && !isAuthenticated) return "/login"

			if (user?.role === "ADMIN" || user?.role === "MANAGER")
				return "/manager/tours"

			return "/client/tours"
		})()

		useGSAP(
			() => {
				if (tours.length === 0 || !gridRef.current) return

				gsap.set("[data-tours-grid-card]", {
					y: 40,
					opacity: 0,
					scale: 0.96,
					transition: "none",
				})

				const animation = gsap.to("[data-tours-grid-card]", {
					y: 0,
					opacity: 1,
					scale: 1,
					duration: 0.6,
					stagger: 0.06,
					ease: "power3.out",
					scrollTrigger: {
						trigger: gridRef.current,
						start: "top 80%",
						toggleActions: "play none none reverse",
					},
					clearProps: "all",
				})

				return () => {
					if (animation.scrollTrigger) {
						animation.scrollTrigger.kill()
					}
					animation.kill()
				}
			},
			{
				scope: gridRef,
				dependencies: [tours],
			},
		)

		if (isLoading) {
			return (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка туров..." />
				</div>
			)
		}

		if (tours.length === 0) {
			return (
				<div className={s.empty}>
					<p className={s.emptyText}>По вашему запросу ничего не найдено</p>

					<p className={s.emptyHint}>
						Попробуйте изменить параметры поиска или фильтры
					</p>
				</div>
			)
		}

		return (
			<div ref={gridRef} className={s.grid}>
				{tours.map((tour, index) => {
					const isAvailable = tour.available !== false

					return (
						<TransitionLink
							key={tour.id}
							href={dashboardHref}
							className={`${s.card} ${!isAvailable ? s.cardUnavailable : ""}`}
							data-tours-grid-card
						>
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
									<div className={s.description}>
										<div className={s.descriptionWrapper}>
											<h3 className={s.cardTitle}>{tour.title}</h3>
										</div>

										<p className={s.text}>{tour.shortDescription}</p>
									</div>

									<ul className={s.list}>
										{tour.tags.map((tag, index) => (
											<li key={index} className={s.listItem}>
												{tag}
											</li>
										))}

										{tour.dateFrom && tour.dateTo && (
											<li
												className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}
											>
												<CalendarDays size={"1.4rem"} />

												<span>
													{formatDate(tour.dateFrom)} —{" "}
													{formatDate(tour.dateTo)}
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
														tour.durationDays
															? `${tour.durationDays} дн.`
															: null,
														tour.durationNights
															? `${tour.durationNights} ноч.`
															: null,
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
											{formatCurrency(tour.price)}
										</span>
									</div>

									<button className={s.bottomButton}>Подробнее</button>
								</div>
							</div>
						</TransitionLink>
					)
				})}
			</div>
		)
	},
	(prevProps, nextProps) => {
		if (prevProps.isLoading !== nextProps.isLoading) {
			return false
		}

		if (prevProps.tours.length !== nextProps.tours.length) {
			return false
		}

		return prevProps.tours.every(
			(tour, i) => tour.id === nextProps.tours[i]?.id,
		)
	},
)
