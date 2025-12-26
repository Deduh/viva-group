"use client"

import { BLUR_PLACEHOLDER, getImageSizes } from "@/lib/image-utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Clock, Landmark, Mail, MapPin, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { memo, useRef } from "react"
import s from "./ContactInfoList.module.scss"

gsap.registerPlugin(ScrollTrigger)

export const ContactInfoList = memo(function ContactInfoList() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-contacts-title]", { y: 40, opacity: 0 })
			gsap.set("[data-contacts-text]", { y: 30, opacity: 0 })
			gsap.set("[data-contacts-card]", { y: 60, opacity: 0, scale: 0.9 })
			gsap.set("[data-contacts-icon]", { scale: 0, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
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
						scale: 1,
						duration: 0.8,
						stagger: 0.1,
						ease: "power3.out",
						clearProps: "all",
					},
					"-=0.4"
				)
				.to(
					"[data-contacts-icon]",
					{
						scale: 1,
						opacity: 1,
						duration: 0.5,
						stagger: 0.1,
						ease: "back.out(1.7)",
						clearProps: "all",
					},
					"<+=0.2"
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
				<h2 className={s.title} data-contacts-title>
					Свяжитесь с нами
				</h2>

				<p className={s.text} data-contacts-text>
					Мы всегда готовы помочь вам организовать незабываемое путешествие.
					Свяжитесь с нами любым удобным способом, и мы ответим в ближайшее
					время.
				</p>
			</div>

			<div className={s.cards}>
				<div className={s.cardsWrapper}>
					<div className={s.card} data-contacts-card>
						<div className={s.cardWrapper}>
							<div className={s.cardTop}>
								<div className={s.icon} data-contacts-icon>
									<Phone className={s.iconWrapper} />
								</div>

								<h4 className={s.cardTitle}>Телефон</h4>
							</div>

							<div className={s.cardDescription}>
								<Link href="tel:+78624440888" className={s.contactLink}>
									+7 (862) 444-0-888
								</Link>

								<Link href="tel:+79182089269" className={s.contactLink}>
									WhatsApp, Валентина: +7 (918) 208-92-69
								</Link>
							</div>
						</div>
					</div>

					<div className={s.card} data-contacts-card>
						<div className={s.cardWrapper}>
							<div className={s.cardTop}>
								<div className={s.icon} data-contacts-icon>
									<Mail className={s.iconWrapper} />
								</div>

								<h4 className={s.cardTitle}>Email</h4>
							</div>

							<div className={s.cardDescription}>
								<Link
									href="mailto:vivatoursochi@gmail.com"
									className={s.contactLink}
								>
									vivatoursochi@gmail.com
								</Link>

								<Link
									href="mailto:v.barchahova@viva-tour.ru"
									className={s.contactLink}
								>
									v.barchahova@viva-tour.ru (для заявок)
								</Link>
							</div>
						</div>
					</div>

					<div className={s.card} data-contacts-card>
						<div className={s.cardImage}>
							<Image
								src={"/advantages/home-advantages-1.webp"}
								alt="Профессионально составленные пакеты туров"
								fill
								sizes={getImageSizes({
									mobile: "100vw",
									tablet: "50vw",
									desktop: "33vw",
								})}
								priority
								placeholder="blur"
								blurDataURL={BLUR_PLACEHOLDER}
							/>
						</div>
					</div>
				</div>

				<div className={s.card} data-contacts-card>
					<div className={s.cardImage}>
						<Image
							src={"/advantages/home-advantages-2.webp"}
							alt="24/7 поддержка клиентов"
							fill
							sizes={getImageSizes({
								mobile: "100vw",
								tablet: "50vw",
								desktop: "33vw",
							})}
							placeholder="blur"
							blurDataURL={BLUR_PLACEHOLDER}
						/>
					</div>
				</div>

				<div className={s.cardsWrapper}>
					<div className={s.card} data-contacts-card>
						<div className={s.cardWrapper}>
							<div className={s.cardTop}>
								<div className={s.icon} data-contacts-icon>
									<Landmark className={s.iconWrapper} />
								</div>

								<h4 className={s.cardTitle}>Реквизиты</h4>
							</div>

							<div className={s.cardDescription}>
								<p className={s.cardText}>ООО «ВИВА»</p>
								<p className={s.cardText}>ИНН 2367011089, КПП 236701001</p>
								<p className={s.cardText}>ОГРН 1192375070491, РТО №021784</p>
								<p className={s.cardText}>Р/счет 40702810420000169025</p>
								<p className={s.cardText}>
									в Банке ООО &quot;БАНК ТОЧКА&quot;, БИК 044525104
								</p>
							</div>
						</div>
					</div>

					<div className={s.card} data-contacts-card>
						<div className={s.cardWrapper}>
							<div className={s.cardTop}>
								<div className={s.icon} data-contacts-icon>
									<Clock className={s.iconWrapper} />
								</div>

								<h4 className={s.cardTitle}>Часы работы</h4>
							</div>

							<div className={s.cardDescription}>
								<p className={s.cardText}>
									Пн-Пт: 9:00 - 18:00
									<br />
									Сб-Вс: выходной
								</p>
							</div>
						</div>
					</div>

					<div className={s.card} data-contacts-card>
						<div className={s.cardWrapper}>
							<div className={s.cardTop}>
								<div className={s.icon} data-contacts-icon>
									<MapPin className={s.iconWrapper} />
								</div>

								<h4 className={s.cardTitle}>Адрес</h4>
							</div>

							<div className={s.cardDescription}>
								<p className={s.cardText}>
									354071, Российская Федерация,
									<br />
									г. Сочи, ул. Гагарина, д. 72, оф. 56/2
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
})
