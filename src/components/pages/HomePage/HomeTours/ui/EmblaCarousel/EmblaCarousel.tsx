"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import {
	BLUR_PLACEHOLDER,
	getImageSizes,
	getTourImageAlt,
	shouldUsePriority,
} from "@/lib/image-utils"
import { formatCurrency } from "@/lib/format"
import type { Tour } from "@/types"
import { useGSAP } from "@gsap/react"
import { EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import gsap from "gsap"
import { Star } from "lucide-react"
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
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
	const dashboardHref =
		!isAuthLoading && !isAuthenticated
			? "/login?callbackUrl=/client/tours"
			: "/client/tours"

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
		}
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
										alt={getTourImageAlt(item.destination)}
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
												<h3 className={s.title}>{item.destination}</h3>

												<div className={s.rating}>
													<Star size={"1.6rem"} color="rgba(234, 179, 8, 1)" />

													<span className={s.ratingNum}>{item.rating}</span>
												</div>
											</div>

											<p className={s.text}>{item.shortDescription}</p>
										</div>

										<ul className={s.list}>
											{item.properties.map((property, index) => (
												<li key={index} className={s.listItem}>
													{property}
												</li>
											))}
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
