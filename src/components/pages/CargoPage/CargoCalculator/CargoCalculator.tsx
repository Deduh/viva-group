"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { memo, useRef } from "react"
import s from "./CargoCalculator.module.scss"

gsap.registerPlugin(ScrollTrigger)

export const CargoCalculator = memo(function CargoCalculator() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-calc-title]", { y: 30, opacity: 0 })
			gsap.set("[data-calc-text]", { y: 24, opacity: 0 })
			gsap.set("[data-calc-button]", { y: 20, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-calc-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-calc-text]",
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.6"
				)
				.to(
					"[data-calc-button]",
					{
						y: 0,
						opacity: 1,
						duration: 0.6,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.4"
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
		<section ref={container} className={s.section} id="calc">
			<div className={s.inner}>
				<div className={s.card}>
					<div className={s.content}>
						<p className={s.eyebrow} data-calc-title>
							Расчет
						</p>

						<h2 className={s.title} data-calc-title>
							Рассчитать стоимость доставки
						</h2>

						<p className={s.text} data-calc-text>
							Сообщите вес, объем, категорию товара и город доставки —
							подготовим точный расчет и сроки.
						</p>
					</div>

					<div className={s.actions}>
						<Link href="/#contacts" className={s.button} data-calc-button>
							Получить расчет
						</Link>

						<span className={s.note}>Ответим в течение рабочего дня</span>
					</div>
				</div>
			</div>
		</section>
	)
})
