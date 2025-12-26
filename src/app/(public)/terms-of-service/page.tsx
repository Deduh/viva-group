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

export default function TermsOfServicePage() {
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

			gsap.set("[data-terms-hero]", { y: 30, opacity: 0 })
			gsap.set("[data-terms-card]", { y: 50, opacity: 0 })

			const heroTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: contentRef.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			heroTimeline.to("[data-terms-hero]", {
				y: 0,
				opacity: 1,
				duration: 0.9,
				stagger: 0.1,
				ease: "power3.out",
				clearProps: "y",
			})

			const cards = gsap.utils.toArray<HTMLElement>("[data-terms-card]")
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
							Terms of Service
						</h1>

						<p ref={textRef} className={s.text}>
							Условия использования
						</p>
					</div>
				</div>
			</StickyHeroSection>

			<PublicWrapper>
				<div className={s.container} ref={contentRef}>
					<section className={s.hero}>
						<div className={s.heroContent}>
							<p className={s.eyebrow} data-terms-hero>
								Документы
							</p>

							<p className={s.subtitle} data-terms-hero>
								Пожалуйста, внимательно прочитайте настоящие Условия
								использования (&quot;Условия&quot;) перед использованием
								веб-сайта https://viva-fest.ru (&quot;Сайт&quot;), управляемого
								ООО «ВИВА» (&quot;мы&quot;, &quot;нас&quot;, &quot;наш&quot;).
							</p>
						</div>
					</section>

					<section className={s.content}>
						<article className={s.card} data-terms-card>
							<h2>1. Использование Сайта</h2>
							<p>
								Ваш доступ к Сайту и его использование обусловлены вашим
								принятием и соблюдением настоящих Условий. Настоящие Условия
								распространяются на всех посетителей, пользователей и других
								лиц, которые получают доступ к Сайту или используют его. Получая
								доступ к Сайту или используя его, вы соглашаетесь соблюдать
								настоящие Условия. Если вы не согласны с какой-либо частью
								условий, вы не можете получить доступ к Сайту.
							</p>
							<p>
								Сайт и его содержимое предназначены для предоставления
								информации о Международном конкурсе-фестивале «ВИВА МАЦУРИ»
								(&quot;Фестиваль&quot;) и для подачи заявок на участие.
							</p>
							<ul>
								<li>
									Вам должно быть не менее 18 лет для подачи заявки или вы
									должны действовать через законного представителя, если не
									достигли этого возраста и это допускается правилами Фестиваля.
								</li>
								<li>
									Вы соглашаетесь не использовать Сайт в незаконных целях или
									таким образом, который может нанести ущерб, вывести из строя,
									перегрузить или ухудшить работу Сайта.
								</li>
								<li>
									Вы несете ответственность за точность информации, которую вы
									предоставляете при подаче заявки или подписке на рассылку.
								</li>
							</ul>
						</article>

						<article className={s.card} data-terms-card>
							<h2>2. Интеллектуальная собственность</h2>
							<p>
								Сайт и его оригинальное содержимое (за исключением контента,
								предоставленного пользователями), функции и функциональность
								являются и останутся исключительной собственностью ООО «ВИВА» и
								его лицензиаров. Сайт защищен авторским правом, товарными
								знаками и другими законами как Российской Федерации, так и
								зарубежных стран. Наши товарные знаки и фирменный стиль не могут
								быть использованы в связи с каким-либо продуктом или услугой без
								предварительного письменного согласия ООО «ВИВА».
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>3. Подача заявок и участие в Фестивале</h2>
							<p>
								Подача заявки на участие в Фестивале регулируется Положением о
								Фестивале (если применимо) и условиями, указанными на
								соответствующих страницах Сайта. Мы оставляем за собой право
								отклонить любую заявку по нашему усмотрению. Условия оплаты,
								отмены и другие детали участия будут сообщены в процессе подачи
								заявки или в Положении о Фестивале.
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>4. Ссылки на другие веб-сайты</h2>
							<p>
								Наш Сайт может содержать ссылки на сторонние веб-сайты или
								сервисы, которые не принадлежат и не контролируются ООО «ВИВА».
								Мы не контролируем и не несем ответственности за контент,
								политику конфиденциальности или действия любых сторонних
								веб-сайтов или сервисов. Вы также признаете и соглашаетесь с
								тем, что ООО «ВИВА» не несет прямой или косвенной
								ответственности за любой ущерб или убытки, вызванные или
								предположительно вызванные использованием или доверием к любому
								такому контенту, товарам или услугам, доступным на любых таких
								веб-сайтах или сервисах или через них.
							</p>
							<p>
								Мы настоятельно рекомендуем вам ознакомиться с условиями
								использования и политикой конфиденциальности любых сторонних
								веб-сайтов или сервисов, которые вы посещаете.
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>5. Ограничение ответственности</h2>
							<p>
								В максимальной степени, разрешенной действующим
								законодательством, ни при каких обстоятельствах ООО «ВИВА», его
								директора, сотрудники, партнеры, агенты, поставщики или
								аффилированные лица не несут ответственности за любые косвенные,
								случайные, специальные, последующие или штрафные убытки,
								включая, помимо прочего, упущенную выгоду, потерю данных,
								невозможность использования, потерю деловой репутации или другие
								нематериальные убытки, возникшие в результате (i) вашего доступа
								к Сайту или его использования, или невозможности доступа или
								использования Сайта; (ii) любого поведения или контента любой
								третьей стороны на Сайте; (iii) любого контента, полученного с
								Сайта; и (iv) несанкционированного доступа, использования или
								изменения ваших передач или контента, независимо от того,
								основана ли претензия на гарантии, контракте, деликте (включая
								небрежность) или любой другой правовой теории, даже если мы были
								уведомлены о возможности такого ущерба.
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>6. Отказ от гарантий</h2>
							<p>
								Использование вами Сайта осуществляется на ваш собственный риск.
								Сайт предоставляется на условиях &quot;КАК ЕСТЬ&quot; и
								&quot;КАК ДОСТУПНО&quot;. Сайт предоставляется без каких-либо
								гарантий, явных или подразумеваемых, включая, помимо прочего,
								подразумеваемые гарантии товарной пригодности, пригодности для
								определенной цели, ненарушения прав или хода исполнения.
							</p>
							<p>
								ООО «ВИВА», его дочерние компании, аффилированные лица и его
								лицензиары не гарантируют, что:
							</p>
							<ul>
								<li>
									Сайт будет функционировать бесперебойно, безопасно или будет
									доступен в любое конкретное время или в любом месте;
								</li>
								<li>Любые ошибки или дефекты будут исправлены;</li>
								<li>
									Сайт не содержит вирусов или других вредоносных компонентов;
								</li>
								<li>
									Результаты использования Сайта будут соответствовать вашим
									требованиям.
								</li>
							</ul>
						</article>

						<article className={s.card} data-terms-card>
							<h2>7. Применимое право</h2>
							<p>
								Настоящие Условия регулируются и толкуются в соответствии с
								законодательством Российской Федерации, без учета его
								коллизионных норм. Наша неспособность обеспечить соблюдение
								какого-либо права или положения настоящих Условий не будет
								считаться отказом от этих прав. Если какое-либо положение
								настоящих Условий будет признано судом недействительным или не
								имеющим законной силы, остальные положения настоящих Условий
								останутся в силе. Настоящие Условия составляют полное соглашение
								между нами относительно нашего Сайта и заменяют собой любые
								предыдущие соглашения, которые могли существовать между нами
								относительно Сайта.
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>8. Изменения</h2>
							<p>
								Мы оставляем за собой право по собственному усмотрению изменять
								или заменять настоящие Условия в любое время. Если изменение
								является существенным, мы постараемся предоставить уведомление
								не менее чем за 30 дней до вступления в силу любых новых
								условий. Что представляет собой существенное изменение, будет
								определяться по нашему собственному усмотрению. Продолжая
								получать доступ к нашему Сайту или использовать его после
								вступления в силу этих изменений, вы соглашаетесь соблюдать
								измененные условия. Если вы не согласны с новыми условиями,
								пожалуйста, прекратите использование Сайта.
							</p>
						</article>

						<article className={s.card} data-terms-card>
							<h2>9. Свяжитесь с нами</h2>
							<p>
								Если у вас есть какие-либо вопросы по поводу настоящих Условий,
								пожалуйста, свяжитесь с нами:
							</p>
							<p>Email: info@viva-education.com</p>
							<p>
								По адресу: 354071, Российская Федерация, г. Сочи, ул. Гагарина,
								д. 72, оф. 56/2, ООО «ВИВА»
							</p>
						</article>
					</section>
				</div>
			</PublicWrapper>
		</>
	)
}
