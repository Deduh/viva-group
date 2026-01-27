"use client"

import { useTours } from "@/hooks/useTours"
import { useGSAP } from "@gsap/react"
import { EmblaOptionsType } from "embla-carousel"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMemo, useRef, useState } from "react"
import s from "./HomeTours.module.scss"
import { EmblaCarousel } from "./ui/EmblaCarousel/EmblaCarousel"
import { FilterCarousel } from "./ui/FilterCarousel/FilterCarousel"

gsap.registerPlugin(ScrollTrigger)

const OPTIONS: EmblaOptionsType = { slidesToScroll: "auto" }

export function HomeTours() {
	const container = useRef(null)

	const { tours, availableCategories } = useTours()

	const allCategories = useMemo(() => {
		return ["Все направления", ...availableCategories]
	}, [availableCategories])

	const [activeCategory, setActiveCategory] =
		useState<string>("Все направления")

	const filteredTours = useMemo(() => {
		if (activeCategory === "Все направления") return tours

		return tours.filter(tour => tour.categories?.includes(activeCategory))
	}, [activeCategory, tours])

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-tours-subtitle]", { y: 20, opacity: 0 })
			gsap.set("[data-tours-title]", { y: 40, opacity: 0 })
			gsap.set("[data-tours-text]", { y: 30, opacity: 0 })
			gsap.set("[data-tours-carousel]", { y: 60, opacity: 0, scale: 0.98 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-tours-subtitle]", {
				opacity: 1,
				y: 0,
				duration: 0.6,
				ease: "power2.out",
				clearProps: "y",
			})
				.to(
					"[data-tours-title]",
					{
						opacity: 1,
						y: 0,
						duration: 0.8,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.4"
				)
				.to(
					"[data-tours-text]",
					{
						opacity: 1,
						y: 0,
						duration: 0.8,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.6"
				)
				.to(
					"[data-tours-carousel]",
					{
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 1,
						ease: "power4.out",
						clearProps: "all",
					},
					"-=0.5"
				)

			return () => {
				if (tl.scrollTrigger) {
					tl.scrollTrigger.kill()
				}

				tl.kill()
			}
		},
		{ scope: container, dependencies: [] }
	)

	return (
		<section ref={container} className={s.section}>
			<div className={s.description}>
				<span className={s.subtitle} data-tours-subtitle>
					Премиальные туры
				</span>

				<div className={s.descriptionWrapper}>
					<h2 className={s.title} data-tours-title>
						Найдите идеальное направление
					</h2>

					<p className={s.text} data-tours-text>
						Собрали самые востребованные туры сезона: от белоснежных пляжей до
						городов с богатой историей. Каждое направление включает авиаперелет,
						проживание и авторские экскурсии.
					</p>
				</div>
			</div>

			<div className={s.carousel} data-tours-carousel>
				<FilterCarousel
					categories={allCategories}
					active={activeCategory}
					onSelect={setActiveCategory}
				/>

				<EmblaCarousel slides={filteredTours} options={OPTIONS} />
			</div>
		</section>
	)
}
