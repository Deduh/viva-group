"use client"

import { StickyHeroSection } from "@/components/ui/StickyHeroSection"
import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useLayoutEffect, useRef } from "react"
import s from "./HomeIntro.module.scss"
import { SearchBar } from "./ui/SearchBar/SearchBar"

export function HomeIntro() {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const textRef = useRef<HTMLParagraphElement>(null)
	const searchWrapperRef = useRef<HTMLDivElement>(null)

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
					"-=1",
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
					"-=0.8",
				)

			return () => {
				tlIntro.kill()
			}
		},
		{
			dependencies: [isLoaded, isTransitionComplete],
		},
	)

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
					<SearchBar />
				</div>
			</div>
		</StickyHeroSection>
	)
}
