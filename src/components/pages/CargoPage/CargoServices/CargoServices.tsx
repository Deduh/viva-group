"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
	ClipboardList,
	PackageCheck,
	PackageSearch,
	ShieldCheck,
	Truck,
	Warehouse,
} from "lucide-react"
import { memo, useRef } from "react"
import s from "./CargoServices.module.scss"

gsap.registerPlugin(ScrollTrigger)

const services = [
	{
		title: "Выкуп у поставщика",
		text: "Берем на себя оплату, сверяем инвойсы и контролируем отгрузку.",
		icon: PackageSearch,
	},
	{
		title: "Проверка качества",
		text: "Фото/видео-отчет, сверка количества и состояния товара.",
		icon: PackageCheck,
	},
	{
		title: "Консолидация на складе",
		text: "Собираем партии от разных поставщиков в одну отправку.",
		icon: Warehouse,
	},
	{
		title: "Упаковка и маркировка",
		text: "Укрепляем упаковку, маркируем и готовим к отправке.",
		icon: ClipboardList,
	},
	{
		title: "Страхование груза",
		text: "По запросу оформляем страховку и фиксируем ответственность.",
		icon: ShieldCheck,
	},
	{
		title: "Доставка до вашего города",
		text: "Подбираем маршрут и сроки под вашу задачу.",
		icon: Truck,
	},
]

export const CargoServices = memo(function CargoServices() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-services-title]", { y: 30, opacity: 0 })
			gsap.set("[data-services-text]", { y: 24, opacity: 0 })
			gsap.set("[data-services-card]", { y: 40, opacity: 0 })
			gsap.set("[data-services-icon]", { scale: 0.8, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-services-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-services-text]",
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.6",
				)
				.to(
					"[data-services-card]",
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						stagger: 0.08,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.4",
				)
				.to(
					"[data-services-icon]",
					{
						scale: 1,
						opacity: 1,
						duration: 0.6,
						stagger: 0.08,
						ease: "back.out(1.7)",
						clearProps: "all",
					},
					"<+=0.1",
				)

			return () => {
				if (tl.scrollTrigger) {
					tl.scrollTrigger.kill()
				}

				tl.kill()
			}
		},
		{ scope: container, dependencies: [] },
	)

	return (
		<section ref={container} className={s.section}>
			<div className={s.inner}>
				<div className={s.description}>
					<p className={s.eyebrow} data-services-title>
						Услуги
					</p>

					<h2 className={s.title} data-services-title>
						Карго-сервис под ключ
					</h2>

					<p className={s.text} data-services-text>
						Организуем выкуп, проверку, консолидацию и доставку из Китая в СНГ.
						Вы знаете, что происходит с грузом на каждом этапе.
					</p>
				</div>

				<div className={s.cards}>
					{services.map(service => {
						const Icon = service.icon

						return (
							<div key={service.title} className={s.card} data-services-card>
								<div className={s.cardHeader}>
									<div className={s.icon} data-services-icon>
										<Icon size={"2.2rem"} />
									</div>

									<h3 className={s.cardTitle}>{service.title}</h3>
								</div>

								<p className={s.cardText}>{service.text}</p>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
})
