"use client"

import { BLUR_PLACEHOLDER, getImageSizes } from "@/lib/image-utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CalendarCheck, Headset, Medal, Shield } from "lucide-react"
import Image from "next/image"
import { memo, useRef } from "react"
import s from "./HomeAdvantages.module.scss"

gsap.registerPlugin(ScrollTrigger)

export const HomeAdvantages = memo(function HomeAdvantages() {
	const container = useRef(null)

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-advantages-title]", { y: 40, opacity: 0 })
			gsap.set("[data-advantages-text]", { y: 30, opacity: 0 })
			gsap.set("[data-advantages-card]", { y: 60, opacity: 0, scale: 0.9 })
			gsap.set("[data-advantages-icon]", { scale: 0, opacity: 0 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-advantages-title]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-advantages-text]",
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
					"[data-advantages-card]",
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
					"[data-advantages-icon]",
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
				<h2 className={s.title} data-advantages-title>
					Ваш надежный партнёр
				</h2>

				<p className={s.text} data-advantages-text>
					В Viva мы воплощаем ваши мечты о путешествиях в реальность благодаря
					индивидуальному подходу, непревзойденным ценам и незабываемым
					впечатлениям.
				</p>
			</div>

			<div className={s.cards}>
				<div className={s.cardsWrapper}>
					<div className={s.card} data-advantages-card>
						<div className={s.cardWrapper}>
							<div className={s.icon} data-advantages-icon>
								<Medal className={s.iconWrapper} />
							</div>

							<div className={s.cardDescription}>
								<h4 className={s.cardTitle}>
									Профессионально составленные пакеты
								</h4>

								<p className={s.cardText}>
									Тщательно разработанные маршруты, адаптированные к вашим
									предпочтениям.
								</p>
							</div>
						</div>
					</div>

					<div className={s.card} data-advantages-card>
						<div className={s.cardWrapper}>
							<div className={s.icon} data-advantages-icon>
								<Headset className={s.iconWrapper} />
							</div>

							<div className={s.cardDescription}>
								<h4 className={s.cardTitle}>24/7 поддержка клиентов</h4>

								<p className={s.cardText}>
									Мы помогаем вам на каждом этапе вашего путешествия, в любое
									время и в любом месте.
								</p>
							</div>
						</div>
					</div>

					<div className={s.card} data-advantages-card>
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

				<div className={s.card} data-advantages-card>
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
					<div className={s.card} data-advantages-card>
						<div className={s.cardImage}>
							<Image
								src={"/advantages/home-advantages-3.webp"}
								alt="Простое бронирование и страхование"
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

					<div className={s.card} data-advantages-card>
						<div className={s.cardWrapper}>
							<div className={s.icon} data-advantages-icon>
								<CalendarCheck className={s.iconWrapper} />
							</div>

							<div className={s.cardDescription}>
								<h4 className={s.cardTitle}>Простое бронирование</h4>

								<p className={s.cardText}>
									Простой и безопасный процесс бронирования, дающий вам
									уверенность.
								</p>
							</div>
						</div>
					</div>

					<div className={s.card} data-advantages-card>
						<div className={s.cardWrapper}>
							<div className={s.icon} data-advantages-icon>
								<Shield className={s.iconWrapper} />
							</div>

							<div className={s.cardDescription}>
								<h4 className={s.cardTitle}>
									Страхование путешествий включено
								</h4>

								<p className={s.cardText}>
									Мы ставим вашу безопасность на первое место, предлагая
									комплексное страховое покрытие.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
})
