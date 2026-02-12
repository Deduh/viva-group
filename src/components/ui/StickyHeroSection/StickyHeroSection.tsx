"use client"

import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useScrollFadeAnimation } from "@/hooks/useScrollFadeAnimation"
import { ReactNode, useEffect, useRef, useState } from "react"
import s from "./StickyHeroSection.module.scss"

interface StickyHeroSectionProps {
	children: ReactNode
	backgroundImage?: string
	className?: string
	enabled?: boolean
	"data-season"?: "summer" | "winter" | "all"
}

export function StickyHeroSection({
	children,
	backgroundImage,
	className,
	enabled,
	"data-season": dataSeason,
}: StickyHeroSectionProps) {
	const containerRef = useRef<HTMLElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [isMobile, setIsMobile] = useState(false)

	const { isLoaded } = usePreloader()
	const { isTransitionComplete } = usePageTransition()

	const shouldEnable =
		enabled !== undefined ? enabled : isLoaded && isTransitionComplete

	useEffect(() => {
		const media =
			typeof window !== "undefined"
				? window.matchMedia("(pointer: coarse), (max-width: 768px)")
				: null

		if (!media) return

		const update = () => setIsMobile(media.matches)

		update()

		media.addEventListener("change", update)
		return () => media.removeEventListener("change", update)
	}, [])

	useScrollFadeAnimation({
		containerRef,
		wrapperRef,
		enabled: shouldEnable && !isMobile,
	})

	return (
		<section ref={containerRef} className={s.section}>
			<div
				ref={wrapperRef}
				className={`${s.contentContainer} ${className || ""}`}
				data-season={dataSeason}
				style={
					backgroundImage
						? {
								backgroundImage: `url(${backgroundImage})`,
							}
						: undefined
				}
			>
				{children}
			</div>
		</section>
	)
}
