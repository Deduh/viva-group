"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { BusFront, Plane, ShieldUser, Users } from "lucide-react"
import { memo, useRef } from "react"
import s from "./GroupTransportBenefits.module.scss"

gsap.registerPlugin(ScrollTrigger)

export const GroupTransportBenefits = memo(function GroupTransportBenefits() {
	const container = useRef<HTMLElement>(null)
	const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()

	const dashboardHref = (() => {
		if (!isAuthLoading && !isAuthenticated) return "/login"

		if (user?.role === "ADMIN" || user?.role === "MANAGER")
			return "/manager/tours"

		return "/client/tours"
	})()

	useGSAP(
		() => {
			if (!container.current) return

			gsap.set("[data-group-benefits-subtitle]", { y: 40, opacity: 0 })
			gsap.set("[data-group-benefits-title]", { y: 40, opacity: 0 })
			gsap.set("[data-group-benefits-text]", { y: 30, opacity: 0 })
			gsap.set("[data-group-benefits-item]", { y: 30, opacity: 0 })
			gsap.set("[data-group-benefits-icon]", { scale: 0, opacity: 0 })
			gsap.set("[data-group-benefits-button]", { y: 20, opacity: 0 })
			gsap.set("[data-group-benefits-card]", { y: 60, opacity: 0, scale: 0.9 })

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to("[data-group-benefits-subtitle]", {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			})
				.to(
					"[data-group-benefits-title]",
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
					"[data-group-benefits-text]",
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.4",
				)
				.to(
					"[data-group-benefits-item]",
					{
						y: 0,
						opacity: 1,
						duration: 0.6,
						stagger: 0.1,
						ease: "power2.out",
						clearProps: "y",
					},
					"-=0.4",
				)
				.to(
					"[data-group-benefits-icon]",
					{
						scale: 1,
						opacity: 1,
						duration: 0.5,
						stagger: 0.1,
						ease: "back.out(1.7)",
						clearProps: "all",
					},
					"<+=0.2",
				)
				.to(
					"[data-group-benefits-button]",
					{
						y: 0,
						opacity: 1,
						duration: 0.6,
						ease: "power2.out",
						clearProps: "y",
					},
					"-=0.2",
				)
				.to(
					"[data-group-benefits-card]",
					{
						y: 0,
						opacity: 1,
						scale: 1,
						duration: 0.8,
						stagger: 0.1,
						ease: "power3.out",
						clearProps: "all",
					},
					"-=0.6",
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
		<section ref={container} className={s.benefits}>
			<div className={s.container}>
				<div className={s.leftSide}>
					<div className={s.titleWrapper}>
						<span className={s.subtitle} data-group-benefits-subtitle>
							Что это
						</span>

						<h2 className={s.title} data-group-benefits-title>
							Наши преимущества
						</h2>
					</div>

					<div className={s.description}>
						<div className={s.descriptionWrapper}>
							<p className={s.text} data-group-benefits-text>
								Мы планируем и исполняем маршруты для групп от 10 до 200
								человек: бронируем чартеры или блоки мест, организуем трансферы,
								проживание и питание, согласуем расписание так, чтобы все
								прибыли одновременно и комфортно.
							</p>

							<ul className={s.list}>
								<li className={s.item} data-group-benefits-item>
									<Plane className={s.itemIcon} data-group-benefits-icon />

									<p className={s.itemText}>
										Единая выписка билетов и координация стыковок
									</p>
								</li>

								<li className={s.item} data-group-benefits-item>
									<BusFront className={s.itemIcon} data-group-benefits-icon />

									<p className={s.itemText}>
										Наземные трансферы аэропорт–отель–площадка мероприятия
									</p>
								</li>

								<li className={s.item} data-group-benefits-item>
									<ShieldUser className={s.itemIcon} data-group-benefits-icon />

									<p className={s.itemText}>
										Персональный координатор 24/7 для всей группы
									</p>
								</li>

								<li className={s.item} data-group-benefits-item>
									<Users className={s.itemIcon} data-group-benefits-icon />

									<p className={s.itemText}>
										Работа с корпоративными, школьными и спортивными группами
									</p>
								</li>
							</ul>
						</div>

						<TransitionLink
							href={dashboardHref}
							className={s.button}
							data-group-benefits-button
						>
							Перейти в личный кабинет
						</TransitionLink>
					</div>
				</div>

				<div className={s.rightSide}>
					<div className={s.card} data-group-benefits-card>
						<h4 className={s.cardTitle}>Для кого</h4>

						<p className={s.cardText}>
							Корпоративы, инсентив-туры, спортивные выезды, школьные и
							студенческие группы, делегации на выставки и конференции.
						</p>
					</div>

					<div className={s.card} data-group-benefits-card>
						<h4 className={s.cardTitle}>Сервис</h4>

						<p className={s.cardText}>
							Чартеры и блоки мест у ведущих авиакомпаний, VIP/fast track,
							согласование спецпитания, размещение групп в одном блоке номеров.
						</p>
					</div>

					<div className={s.card} data-group-benefits-card>
						<h4 className={s.cardTitle}>Сопровождение</h4>

						<p className={s.cardText}>
							Выездной куратор встречает группу, ведёт чат, решает пересадки и
							изменения расписания в режиме реального времени.
						</p>
					</div>
				</div>
			</div>
		</section>
	)
})
