"use client"

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
import { EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import gsap from "gsap"
import { CalendarDays, Moon, Sun } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"
import s from "./EmblaCarousel.module.scss"
import {
	NextButton,
	PrevButton,
	usePrevNextButtons,
} from "./EmblaCarouselArrowButtons"
import { DotButton, useDotButton } from "./EmblaCarouselDotButton"

interface EmblaCarouselProps {
	slides: Tour[]
	options?: EmblaOptionsType
}

export function EmblaCarousel({ slides, options }: EmblaCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel(options)
	const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()

	const dashboardHref = (() => {
		if (!isAuthLoading && !isAuthenticated) return "/login"

		if (user?.role === "ADMIN" || user?.role === "MANAGER")
			return "/manager/tours"

		return "/client/tours"
	})()

	const containerRef = useRef(null)

	const { selectedIndex, scrollSnaps, onDotButtonClick } =
		useDotButton(emblaApi)

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi)

	useGSAP(
		() => {
			if (slides.length === 0 || !containerRef.current) return

			gsap.set("[data-embla-card-inner]", {
				y: 40,
				opacity: 0,
				scale: 0.96,
				transition: "none",
			})

			const animation = gsap.to("[data-embla-card-inner]", {
				y: 0,
				opacity: 1,
				scale: 1,
				duration: 0.6,
				stagger: 0.06,
				ease: "power3.out",
				clearProps: "all",
			})

			return () => {
				animation.kill()
			}
		},
		{
			scope: containerRef,
			dependencies: [slides],
		},
	)

	return (
		<div ref={containerRef} className={s.embla}>
			<div className={s.viewport} ref={emblaRef}>
				<div className={s.container}>
					{slides.map((item, index) => (
						<div className={s.card} key={index}>
							<TransitionLink
								href={dashboardHref}
								className={s.cardInner}
								data-embla-card-inner
							>
								<div className={s.image}>
									<Image
										src={item.image}
										alt={getTourImageAlt(item.title)}
										fill
										sizes={getImageSizes({
											mobile: "100vw",
											tablet: "80vw",
											desktop: "70vw",
										})}
										priority={shouldUsePriority(index, 1)}
										placeholder="blur"
										blurDataURL={BLUR_PLACEHOLDER}
									/>
								</div>

								<div className={s.content}>
									<div className={s.top}>
										<div className={s.description}>
											<div className={s.descriptionWrapper}>
												<h3 className={s.title}>{item.title}</h3>
											</div>

											<p className={s.text}>{item.shortDescription}</p>
										</div>

										<ul className={s.list}>
											{item.tags.map((tag, index) => (
												<li key={`${tag}-${index}`} className={s.listItem}>
													{tag}
												</li>
											))}

											{item.dateFrom && item.dateTo && (
												<li
													className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDate}`}
												>
													<CalendarDays size={"1.4rem"} />

													<span>
														{formatDate(item.dateFrom)} —{" "}
														{formatDate(item.dateTo)}
													</span>
												</li>
											)}

											{(item.durationDays || item.durationNights) && (
												<li
													className={`${s.listItem} ${s.metaBadge} ${s.metaBadgeDuration}`}
												>
													<span className={s.metaIconGroup}>
														<Sun size={"1.2rem"} />

														<Moon size={"1.2rem"} />
													</span>

													<span>
														{[
															item.durationDays
																? `${item.durationDays} дн.`
																: null,
															item.durationNights
																? `${item.durationNights} ноч.`
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
											<span className={s.pricePlaceholder}>
												Цена за человека
											</span>

											<span className={s.priceText}>
												{formatCurrency(item.price)}
											</span>
										</div>

										<button className={s.bottomButton} type="button">
											Забронировать
										</button>
									</div>
								</div>
							</TransitionLink>
						</div>
					))}
				</div>
			</div>

			<div className={s.controls}>
				<div className={s.dots}>
					{scrollSnaps.map((_, index) => (
						<DotButton
							key={index}
							onClick={() => onDotButtonClick(index)}
							className={`${s.dot} ${
								index === selectedIndex ? s.dot__selected : ""
							}`}
						/>
					))}
				</div>

				<div className={s.buttons}>
					<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />

					<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
				</div>
			</div>
		</div>
	)
}
