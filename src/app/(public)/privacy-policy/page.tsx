"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { StickyHeroSection } from "@/components/ui/StickyHeroSection"
import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useRef } from "react"
import s from "./page.module.scss"

gsap.registerPlugin(ScrollTrigger)

export default function PrivacyPolicyPage() {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const textRef = useRef<HTMLParagraphElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)

	const { isLoaded } = usePreloader()
	const { isTransitionComplete } = usePageTransition()

	useLayoutEffect(() => {
		const title = titleRef.current
		const text = textRef.current

		if (title) {
			gsap.set(title, { y: 100, opacity: 0 })
		}

		if (text) {
			gsap.set(text, { y: 50, opacity: 0 })
		}

		return () => {
			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (text) {
				gsap.set(text, { clearProps: "all" })
			}
		}
	}, [])

	useGSAP(
		() => {
			if (!isLoaded || !isTransitionComplete) return

			if (!titleRef.current || !textRef.current) return

			const tlIntro = gsap.timeline()

			tlIntro
				.to(titleRef.current, {
					y: 0,
					opacity: 1,
					duration: 1.2,
					ease: "power3.out",
					clearProps: "y",
				})
				.to(
					textRef.current,
					{
						y: 0,
						opacity: 1,
						duration: 1,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=1"
				)

			return () => {
				tlIntro.kill()
			}
		},
		{
			dependencies: [isLoaded, isTransitionComplete],
		}
	)

	useGSAP(
		() => {
			if (!contentRef.current) return

			gsap.set("[data-policy-hero]", { y: 30, opacity: 0 })
			gsap.set("[data-policy-card]", { y: 50, opacity: 0 })

			const heroTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: contentRef.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			heroTimeline.to("[data-policy-hero]", {
				y: 0,
				opacity: 1,
				duration: 0.9,
				stagger: 0.1,
				ease: "power3.out",
				clearProps: "y",
			})

			const cards = gsap.utils.toArray<HTMLElement>("[data-policy-card]")
			const cardTweens: gsap.core.Tween[] = []

			cards.forEach(card => {
				const tween = gsap.to(card, {
					y: 0,
					opacity: 1,
					duration: 0.9,
					ease: "power3.out",
					clearProps: "y",
					scrollTrigger: {
						trigger: card,
						start: "top 85%",
						toggleActions: "play none none reverse",
					},
				})

				cardTweens.push(tween)
			})

			return () => {
				if (heroTimeline.scrollTrigger) {
					heroTimeline.scrollTrigger.kill()
				}

				heroTimeline.kill()
				cardTweens.forEach(tween => {
					if (tween.scrollTrigger) {
						tween.scrollTrigger.kill()
					}

					tween.kill()
				})
			}
		},
		{ scope: contentRef, dependencies: [] }
	)

	return (
		<>
			<StickyHeroSection
				enabled={isTransitionComplete}
				backgroundImage="/backgrounds/viva-background.webp"
			>
				<div className={s.introWrapper}>
					<div className={s.description}>
						<h1 ref={titleRef} className={s.title}>
							Privacy Policy
						</h1>

						<p ref={textRef} className={s.text}>
							Политика конфиденциальности
						</p>
					</div>
				</div>
			</StickyHeroSection>

			<PublicWrapper>
				<div className={s.container} ref={contentRef}>
					<section className={s.hero}>
						<div className={s.heroContent}>
							<p className={s.eyebrow} data-policy-hero>
								Документы
							</p>

							<p className={s.subtitle} data-policy-hero>
								Настоящая Политика конфиденциальности описывает, как ООО «ВИВА»
								(далее – &quot;мы&quot;, &quot;нас&quot; или &quot;наш&quot;)
								собирает, использует и раскрывает вашу информацию в связи с
								использованием вами нашего веб-сайта https://viva-fest.ru (далее
								– &quot;Сайт&quot;) и услуг, предлагаемых на Сайте, включая
								Международный конкурс-фестиваль «ВИВА МАЦУРИ» (далее –
								&quot;Фестиваль&quot;).
							</p>
						</div>
					</section>

					<section className={s.content}>
						<article className={s.card} data-policy-card>
							<h2>1. Сбор информации</h2>
							<p>Мы собираем следующую информацию:</p>
							<ul>
								<li>
									Информация, предоставляемая вами напрямую: Когда вы подаете
									заявку на участие в Фестивале, подписываетесь на нашу рассылку
									или связываетесь с нами, мы можем собирать личную информацию,
									такую как ваше имя, фамилия, отчество, название
									организации/коллектива, номер телефона, адрес электронной
									почты, количество участников, выбранная номинация и пакет
									участия, а также любые другие данные, которые вы
									предоставляете в сообщении.
								</li>
								<li>
									Информация, собираемая автоматически: Когда вы посещаете наш
									Сайт, мы можем автоматически собирать определенную информацию
									о вашем устройстве и использовании Сайта, включая ваш
									IP-адрес, тип браузера, операционную систему, страницы,
									которые вы посетили, и время вашего визита. Эта информация
									собирается с помощью файлов cookie и аналогичных технологий
									отслеживания.
								</li>
							</ul>
						</article>

						<article className={s.card} data-policy-card>
							<h2>2. Использование информации</h2>
							<p>Мы используем собранную информацию для следующих целей:</p>
							<ul>
								<li>Для обработки ваших заявок на участие в Фестивале.</li>
								<li>
									Для связи с вами по вопросам, связанным с Фестивалем и вашими
									заявками.
								</li>
								<li>
									Для отправки вам новостей, обновлений и маркетинговых
									материалов о наших фестивалях и мероприятиях (если вы дали на
									это согласие).
								</li>
								<li>Для улучшения нашего Сайта и услуг.</li>
								<li>Для обеспечения безопасности нашего Сайта.</li>
								<li>Для выполнения юридических обязательств.</li>
							</ul>
						</article>

						<article className={s.card} data-policy-card>
							<h2>3. Раскрытие информации</h2>
							<p>
								Мы не продаем и не передаем вашу личную информацию третьим
								лицам, за исключением следующих случаев:
							</p>
							<ul>
								<li>
									Поставщикам услуг: Мы можем передавать вашу информацию
									сторонним поставщикам услуг, которые помогают нам в работе
									Сайта и организации Фестиваля (например, хостинг-провайдеры,
									сервисы email-рассылок). Эти поставщики услуг имеют доступ к
									вашей информации только для выполнения этих задач от нашего
									имени и обязаны не раскрывать и не использовать ее для
									каких-либо других целей.
								</li>
								<li>
									По закону: Мы можем раскрыть вашу информацию, если это
									требуется по закону или в ответ на действительные запросы
									государственных органов (например, суда или государственного
									учреждения).
								</li>
								<li>
									Защита прав: Мы можем раскрыть информацию, если считаем, что
									это необходимо для защиты наших прав, собственности или
									безопасности, а также прав, собственности или безопасности
									наших пользователей или других лиц.
								</li>
							</ul>
						</article>

						<article className={s.card} data-policy-card>
							<h2>4. Хранение и безопасность данных</h2>
							<p>
								Мы принимаем разумные меры для защиты вашей личной информации от
								несанкционированного доступа, использования или раскрытия.
								Однако ни один метод передачи через Интернет или метод
								электронного хранения не является на 100% безопасным. Ваша
								информация хранится на защищенных серверах на территории
								Российской Федерации.
							</p>
						</article>

						<article className={s.card} data-policy-card>
							<h2>5. Ваши права</h2>
							<p>
								В соответствии с Федеральным законом &quot;О персональных
								данных&quot; № 152-ФЗ, вы имеете право на доступ, исправление,
								удаление вашей личной информации, а также на ограничение ее
								обработки и возражение против такой обработки. Вы также можете
								отозвать свое согласие на обработку персональных данных в любое
								время. Для осуществления этих прав, пожалуйста, свяжитесь с нами
								по контактной информации, указанной ниже.
							</p>
							<p>
								Если вы хотите отказаться от получения наших маркетинговых
								рассылок, вы можете сделать это, перейдя по ссылке
								&quot;отписаться&quot; в нижней части любого маркетингового
								письма или связавшись с нами.
							</p>
						</article>

						<article className={s.card} data-policy-card>
							<h2>6. Файлы Cookie</h2>
							<p>
								Наш Сайт может использовать файлы cookie для улучшения вашего
								пользовательского опыта. Файлы cookie – это небольшие текстовые
								файлы, которые сохраняются на вашем устройстве. Вы можете
								настроить свой браузер так, чтобы он отклонял все или некоторые
								файлы cookie, или чтобы предупреждал вас, когда веб-сайты
								устанавливают или получают доступ к файлам cookie. Если вы
								отключите или откажетесь от файлов cookie, обратите внимание,
								что некоторые части этого Сайта могут стать недоступными или
								работать некорректно.
							</p>
						</article>

						<article className={s.card} data-policy-card>
							<h2>7. Ссылки на другие веб-сайты</h2>
							<p>
								Наш Сайт может содержать ссылки на другие веб-сайты, которые не
								управляются нами. Если вы перейдете по ссылке третьего лица, вы
								будете перенаправлены на сайт этого третьего лица. Мы
								настоятельно рекомендуем вам ознакомиться с Политикой
								конфиденциальности каждого сайта, который вы посещаете. Мы не
								контролируем и не несем ответственности за контент, политику
								конфиденциальности или действия любых сторонних сайтов или
								служб.
							</p>
						</article>

						<article className={s.card} data-policy-card>
							<h2>8. Изменения в настоящей Политике конфиденциальности</h2>
							<p>
								Мы можем время от времени обновлять нашу Политику
								конфиденциальности. Мы уведомим вас о любых изменениях,
								опубликовав новую Политику конфиденциальности на этой странице и
								обновив дату &quot;Последнее обновление&quot; в верхней части
								этой Политики. Вам рекомендуется периодически просматривать
								настоящую Политику конфиденциальности на предмет любых
								изменений. Изменения вступают в силу с момента их публикации на
								этой странице.
							</p>
						</article>

						<article className={s.card} data-policy-card>
							<h2>9. Контактная информация</h2>
							<p>
								Если у вас есть какие-либо вопросы относительно настоящей
								Политики конфиденциальности, пожалуйста, свяжитесь с нами:
							</p>
							<p>Email: info@viva-education.com</p>
							<p>
								По адресу: 354071, Российская Федерация, г. Сочи, ул. Гагарина,
								д. 72, оф. 56/2, ООО «ВИВА»
							</p>
							<p>
								Ответственный за организацию обработки персональных данных в ООО
								«ВИВА»: Кусатов Станислав Анатольевич.
							</p>
						</article>
					</section>
				</div>
			</PublicWrapper>
		</>
	)
}
