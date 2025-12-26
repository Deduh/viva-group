"use client"

import { StickyHeroSection } from "@/components/ui/StickyHeroSection"
import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useLenis } from "lenis/react"
import { ArrowBigDown } from "lucide-react"
import { useCallback, useLayoutEffect, useRef } from "react"
import s from "./HomeIntro.module.scss"

export function HomeIntro() {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const textRef = useRef<HTMLParagraphElement>(null)
	const searchWrapperRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const lenis = useLenis()

	const { isLoaded } = usePreloader()
	const { isTransitionComplete } = usePageTransition()

	useLayoutEffect(() => {
		const title = titleRef.current
		const text = textRef.current
		const searchWrapper = searchWrapperRef.current

		if (title) {
			gsap.set(title, { y: 100, opacity: 0 })
		}

		if (text) {
			gsap.set(text, { y: 50, opacity: 0 })
		}

		if (searchWrapper) {
			gsap.set(searchWrapper, { y: 50, opacity: 0 })
		}

		return () => {
			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (text) {
				gsap.set(text, { clearProps: "all" })
			}

			if (searchWrapper) {
				gsap.set(searchWrapper, { clearProps: "all" })
			}
		}
	}, [])

	useGSAP(
		() => {
			if (!isLoaded || !isTransitionComplete) return

			if (!titleRef.current || !textRef.current || !searchWrapperRef.current)
				return

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
				.to(
					searchWrapperRef.current,
					{
						y: 0,
						opacity: 1,
						duration: 1,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.8"
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
			if (!buttonRef.current) return

			const arrowMain = buttonRef.current.querySelector(
				`[data-home-arrow-main]`
			) as HTMLElement
			const arrowSecondary = buttonRef.current.querySelector(
				`[data-home-arrow-secondary]`
			) as HTMLElement

			if (!arrowMain || !arrowSecondary) return

			const tl = gsap
				.timeline({ paused: true })
				.to(arrowMain, {
					y: "100%",
					duration: 0.3,
					ease: "power2.inOut",
				})
				.to(
					arrowSecondary,
					{
						y: "0%",
						duration: 0.3,
						ease: "power2.inOut",
					},
					"<"
				)

			gsap.set(arrowSecondary, { y: "-100%" })

			const handleEnter = () => tl.play()
			const handleLeave = () => tl.reverse()

			const button = buttonRef.current
			button.addEventListener("mouseenter", handleEnter)
			button.addEventListener("mouseleave", handleLeave)

			return () => {
				button.removeEventListener("mouseenter", handleEnter)
				button.removeEventListener("mouseleave", handleLeave)
				tl.kill()
			}
		},
		{ scope: buttonRef }
	)

	const handleScrollToSections = useCallback(() => {
		const target =
			document.querySelector<HTMLElement>("[data-public-wrapper]") || null

		if (!target) return

		if (lenis) {
			lenis.scrollTo(target, { offset: 0, duration: 2 })
		} else {
			target.scrollIntoView({ behavior: "smooth" })
		}
	}, [lenis])

	return (
		<StickyHeroSection backgroundImage="/backgrounds/viva-background.webp">
			<div className={s.introWrapper}>
				<div className={s.description}>
					<h1 ref={titleRef} className={s.title}>
						ADVENTURE
					</h1>

					<p ref={textRef} className={s.text}>
						Путешествуйте вместе с Вива Тур и открывайте для себя самые лучшие
						направления по самым лучшим ценам!
					</p>
				</div>

				<div ref={searchWrapperRef} className={s.searchWrapper}>
					<button
						className={s.button}
						type="button"
						onClick={handleScrollToSections}
						ref={buttonRef}
					>
						<div className={s.buttonText}>Перейти к разделам</div>

						<div className={s.buttonIcon}>
							<div className={s.arrowMain} data-home-arrow-main>
								<ArrowBigDown size={"1.6rem"} />
							</div>

							<div className={s.arrowSecondary} data-home-arrow-secondary>
								<ArrowBigDown size={"1.6rem"} />
							</div>
						</div>
					</button>
				</div>
			</div>
		</StickyHeroSection>
	)
}
