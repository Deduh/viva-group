"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { memo, useRef } from "react"
import s from "./CargoFaq.module.scss"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
	{
		question: "Какие товары вы перевозите?",
		answer:
			"Перевозим большинство категорий. Ограничения согласуем до оформления.",
	},
	{
		question: "Можно ли объединить грузы от разных поставщиков?",
		answer:
			"Да, консолидация на складе включена — собираем партии в одну отправку.",
	},
	{
		question: "Как проходит проверка качества?",
		answer: "Делаем фото/видео-отчет, сверяем количество и состояние товара.",
	},
	{
		question: "Есть ли страховка?",
		answer: "Да, по запросу оформляем страхование и фиксируем ответственность.",
	},
	{
		question: "Как узнать точную стоимость?",
		answer: "Нужны вес, объем, категория товара и город доставки — рассчитаем.",
	},
	{
		question: "Сколько занимает доставка?",
		answer: "Срок зависит от маршрута и типа перевозки. Сообщаем при расчете.",
	},
]

export const CargoFaq = memo(function CargoFaq() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-faq-title]", { y: 30, opacity: 0 })
			gsap.set("[data-faq-text]", { y: 24, opacity: 0 })
			gsap.set("[data-faq-card]", { y: 40, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-faq-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-faq-text]",
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
					"[data-faq-card]",
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
					<p className={s.eyebrow} data-faq-title>
						FAQ
					</p>

					<h2 className={s.title} data-faq-title>
						Частые вопросы
					</h2>

					<p className={s.text} data-faq-text>
						Если не нашли ответа — напишите нам, и мы поможем.
					</p>
				</div>

				<div className={s.cards}>
					{faqs.map(item => (
						<div key={item.question} className={s.card} data-faq-card>
							<h3 className={s.cardTitle}>{item.question}</h3>

							<p className={s.cardText}>{item.answer}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
})
