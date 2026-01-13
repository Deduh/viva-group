"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Mail, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"
import { memo, useRef } from "react"
import s from "./CargoContacts.module.scss"

gsap.registerPlugin(ScrollTrigger)

const contacts = [
	{
		title: "Telegram",
		value: "@SKusatov",
		href: "https://t.me/SKusatov",
		icon: MessageCircle,
	},
	{
		title: "WhatsApp",
		value: "+7 777 565 87 06",
		href: "https://wa.me/77775658706",
		icon: Phone,
	},
	{
		title: "Email",
		value: "vivacargo@gmail.com",
		href: "mailto:vivacargo@gmail.com",
		icon: Mail,
	},
]

export const CargoContacts = memo(function CargoContacts() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-contacts-title]", { y: 30, opacity: 0 })
			gsap.set("[data-contacts-text]", { y: 24, opacity: 0 })
			gsap.set("[data-contacts-card]", { y: 40, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-contacts-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-contacts-text]",
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
					"[data-contacts-card]",
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
					<p className={s.eyebrow} data-contacts-title>
						Контакты
					</p>

					<h2 className={s.title} data-contacts-title>
						Свяжитесь с нами
					</h2>

					<p className={s.text} data-contacts-text>
						Напишите удобным способом — ответим и подготовим расчет.
					</p>
				</div>

				<div className={s.cards}>
					{contacts.map(contact => {
						const Icon = contact.icon

						return (
							<Link
								key={contact.title}
								href={contact.href}
								className={s.card}
								target="_blank"
								rel="noreferrer"
								data-contacts-card
							>
								<div className={s.icon}>
									<Icon size={22} />
								</div>

								<div className={s.cardContent}>
									<span className={s.cardTitle}>{contact.title}</span>
									<span className={s.cardValue}>{contact.value}</span>
								</div>
							</Link>
						)
					})}
				</div>
			</div>
		</section>
	)
})
