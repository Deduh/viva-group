"use client"

import { StickyHeroSection } from "@/components/ui/StickyHeroSection"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { memo, useLayoutEffect, useRef } from "react"
import s from "./GroupTransportHero.module.scss"

interface GroupTransportHeroProps {
	title: string
	subtitle: string
	season?: "summer" | "winter" | "all"
	titleRef?: React.RefObject<HTMLHeadingElement>
	subtitleRef?: React.RefObject<HTMLParagraphElement>
	backgroundImage?: string
}

export const GroupTransportHero = memo(function GroupTransportHero({
	title,
	subtitle,
	season = "all",
	titleRef: externalTitleRef,
	subtitleRef: externalSubtitleRef,
	backgroundImage = "/backgrounds/viva-background.webp",
}: GroupTransportHeroProps) {
	const internalTitleRef = useRef<HTMLHeadingElement>(null)
	const internalSubtitleRef = useRef<HTMLParagraphElement>(null)
	const { isTransitionComplete } = usePageTransition()

	const titleRef = externalTitleRef || internalTitleRef
	const subtitleRef = externalSubtitleRef || internalSubtitleRef

	useLayoutEffect(() => {
		const title = titleRef.current
		const subtitle = subtitleRef.current

		if (title) {
			gsap.set(title, { y: 60, autoAlpha: 0 })
		}

		if (subtitle) {
			gsap.set(subtitle, { y: 40, autoAlpha: 0 })
		}

		return () => {
			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (subtitle) {
				gsap.set(subtitle, { clearProps: "all" })
			}
		}
	}, [titleRef, subtitleRef])

	useGSAP(
		() => {
			if (!isTransitionComplete) return

			const title = titleRef.current
			const subtitle = subtitleRef.current

			if (!title || !subtitle) return

			const tl = gsap.timeline()

			tl.to(title, {
				y: 0,
				autoAlpha: 1,
				duration: 0.8,
				ease: "power3.out",
				clearProps: "y",
			}).to(
				subtitle,
				{
					y: 0,
					autoAlpha: 1,
					duration: 0.6,
					ease: "power2.out",
					clearProps: "y",
				},
				"-=0.4"
			)

			return () => {
				tl.kill()
			}
		},
		{
			dependencies: [isTransitionComplete, titleRef, subtitleRef],
		}
	)

	return (
		<StickyHeroSection
			enabled={isTransitionComplete}
			data-season={season}
			backgroundImage={backgroundImage}
		>
			<div className={s.introWrapper}>
				<div className={s.description}>
					<h1 ref={titleRef} className={s.title}>
						{title}
					</h1>

					<p ref={subtitleRef} className={s.text}>
						{subtitle}
					</p>
				</div>
			</div>
		</StickyHeroSection>
	)
})
