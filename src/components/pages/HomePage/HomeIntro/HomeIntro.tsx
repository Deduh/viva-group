"use client"

import { CurrencySelector } from "@/components/currency/CurrencySelector/CurrencySelector"
import { CurrencyTicker } from "@/components/currency/CurrencyTicker/CurrencyTicker"
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
	const searchWrapperRef = useRef<HTMLDivElement>(null)

	const { isLoaded } = usePreloader()
	const { isTransitionComplete } = usePageTransition()

	useLayoutEffect(() => {
		const title = titleRef.current
		const searchWrapper = searchWrapperRef.current

		if (title) {
			gsap.set(title, { y: 100, opacity: 0 })
		}

		if (searchWrapper) {
			gsap.set(searchWrapper, { y: 50, opacity: 0 })
		}

		return () => {
			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (searchWrapper) {
				gsap.set(searchWrapper, { clearProps: "all" })
			}
		}
	}, [])

	useGSAP(
		() => {
			if (!isLoaded || !isTransitionComplete) return

			if (!titleRef.current || !searchWrapperRef.current) return

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
					searchWrapperRef.current,
					{
						y: 0,
						opacity: 1,
						duration: 1,
						ease: "power3.out",
						clearProps: "y",
					},
					"-=0.85",
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
				</div>

				<div ref={searchWrapperRef} className={s.searchWrapper}>
					<div className={s.toolsRow}>
						<CurrencyTicker />

						<div className={s.toolsFooter}>
							<div className={s.currencySlot}>
								<CurrencySelector compact />
							</div>

							{/* <TransitionLink href="/for-agents" className={s.agentBadge}>
								Для турагентов
							</TransitionLink> */}
						</div>
					</div>

					<SearchBar />
				</div>
			</div>
		</StickyHeroSection>
	)
}
