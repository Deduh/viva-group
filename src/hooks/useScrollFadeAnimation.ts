import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { RefObject } from "react"

gsap.registerPlugin(ScrollTrigger)

interface UseScrollFadeAnimationOptions {
	containerRef: RefObject<HTMLElement>
	wrapperRef: RefObject<HTMLElement>
	enabled?: boolean
	scale?: number
	opacity?: number
	borderRadius?: string
	start?: string
	end?: string
}

export function useScrollFadeAnimation({
	containerRef,
	wrapperRef,
	enabled = true,
	scale = 0.9,
	opacity = 0.6,
	borderRadius = "3rem",
	start = "top top",
	end = "bottom top",
}: UseScrollFadeAnimationOptions) {
	useGSAP(
		() => {
			if (!enabled || !containerRef.current || !wrapperRef.current) return

			const scrollAnimation = gsap.to(wrapperRef.current, {
				scale,
				opacity,
				borderRadius,
				ease: "none",
				scrollTrigger: {
					trigger: containerRef.current,
					start,
					end,
					scrub: true,
				},
			})

			return () => {
				if (scrollAnimation.scrollTrigger) {
					scrollAnimation.scrollTrigger.kill()
				}

				scrollAnimation.kill()
			}
		},
		{
			scope: containerRef,
			dependencies: [enabled],
		}
	)
}
