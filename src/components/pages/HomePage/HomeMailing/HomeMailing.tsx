"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { memo, useRef } from "react"
import s from "./HomeMailing.module.scss"
import { InputMail } from "./ui/InputMail/InputMail"

gsap.registerPlugin(ScrollTrigger)

export const HomeMailing = memo(function HomeMailing() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-mailing-title], [data-mailing-text]", {
				y: 30,
				opacity: 0,
			})

			gsap.set("[data-mailing-input]", {
				y: 40,
				opacity: 0,
				scale: 0.95,
			})

			gsap.set("[data-mailing-contact]", {
				y: 20,
				opacity: 0,
			})

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 70%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-mailing-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-mailing-text]",
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
					"[data-mailing-input]",
					{
						y: 0,
						opacity: 1,
						scale: 1,
						duration: 0.7,
						ease: "back.out(1.2)",
						clearProps: "all",
					},
					"-=0.4"
				)
				.to(
					"[data-mailing-contact]",
					{
						y: 0,
						opacity: 1,
						duration: 0.6,
						stagger: 0.15,
						ease: "power2.out",
						clearProps: "all",
					},
					"-=0.2"
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
				<h2 className={s.title} data-mailing-title>
					Начните приключение
				</h2>

				<p className={s.text} data-mailing-text>
					Оставьте свою почту, и персональный менеджер подберет идеальные даты,
					перелеты и развлечения, а также пришлет инсайды и закрытые
					предложения.
				</p>
			</div>

			<div className={s.contacts}>
				<div className={s.inputWrapper} data-mailing-input>
					<InputMail />
				</div>

				<div className={s.contactsWrapper}>
					<div className={s.contact} data-mailing-contact>
						<span className={s.contactTitle}>Позвоните нам</span>

						<Link className={s.contactLink} href="tel:+78624440888">
							+7 (862) 444-0-888
						</Link>
					</div>

					<div className={s.contact} data-mailing-contact>
						<span className={s.contactTitle}>Напишите</span>

						<Link
							className={s.contactLink}
							href="mailto:vivatoursochi@gmail.com"
						>
							vivatoursochi@gmail.com
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
})
