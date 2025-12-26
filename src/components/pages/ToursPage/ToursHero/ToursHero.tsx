"use client"

import { StickyHeroSection } from "@/components/ui/StickyHeroSection"
import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { memo, useLayoutEffect, useRef } from "react"
import s from "./ToursHero.module.scss"

interface ToursHeroProps {
	season: "summer" | "winter" | "all"
}

export const ToursHero = memo(function ToursHero({ season }: ToursHeroProps) {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const textRef = useRef<HTMLParagraphElement>(null)

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

	return (
		<StickyHeroSection
			enabled={isTransitionComplete}
			data-season={season}
			backgroundImage="/backgrounds/viva-background.webp"
		>
			<div className={s.introWrapper}>
				<div className={s.description}>
					<h1 ref={titleRef} className={s.title}>
						Our tours
					</h1>

					<p ref={textRef} className={s.text}>
						Путешествия на любой вкус и бюджет
					</p>
				</div>
			</div>
		</StickyHeroSection>
	)
})
