"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { memo, useRef } from "react"
import s from "./CargoProcess.module.scss"

gsap.registerPlugin(ScrollTrigger)

const steps = [
	{
		title: "Заявка и расчет",
		text: "Оставляете параметры груза и получаете точную стоимость.",
	},
	{
		title: "Выкуп у поставщика",
		text: "Оплачиваем товар, подтверждаем позиции и сроки.",
	},
	{
		title: "Проверка и консолидация",
		text: "Проверяем качество и собираем партии на складе.",
	},
	{
		title: "Упаковка и маркировка",
		text: "Укрепляем упаковку и готовим груз к отправке.",
	},
	{
		title: "Доставка и трекинг",
		text: "Подбираем маршрут и сообщаем о статусе.",
	},
	{
		title: "Получение груза",
		text: "Вы принимаете товар и документы в своем городе.",
	},
]

export const CargoProcess = memo(function CargoProcess() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-process-title]", { y: 30, opacity: 0 })
			gsap.set("[data-process-text]", { y: 24, opacity: 0 })
			gsap.set("[data-process-step]", { y: 40, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-process-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-process-text]",
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
					"[data-process-step]",
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						stagger: 0.08,
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
		<section ref={container} className={s.section}>
			<div className={s.inner}>
				<div className={s.description}>
					<p className={s.eyebrow} data-process-title>
						Процесс
					</p>

					<h2 className={s.title} data-process-title>
						Как мы работаем
					</h2>

					<p className={s.text} data-process-text>
						Понятная схема из шести шагов — от заявки до выдачи груза в вашем
						городе.
					</p>
				</div>

				<div className={s.steps}>
					{steps.map((step, index) => (
						<div key={step.title} className={s.step} data-process-step>
							<div className={s.stepNumber}>
								{String(index + 1).padStart(2, "0")}
							</div>

							<div className={s.stepContent}>
								<h3 className={s.stepTitle}>{step.title}</h3>

								<p className={s.stepText}>{step.text}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
})
