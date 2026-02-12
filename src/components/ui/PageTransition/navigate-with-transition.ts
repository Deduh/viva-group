"use client"

import gsap from "gsap"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type NavigateMode = "push" | "replace"

export function navigateWithTransition(
	router: AppRouterInstance,
	href: string,
	setIsTransitionComplete: (value: boolean) => void,
	mode: NavigateMode = "push",
) {
	const navigate = () => {
		if (mode === "replace") router.replace(href)
		else router.push(href)
	}

	const container = document.getElementById("page-transition-container")

	if (!container) {
		navigate()

		return
	}

	const columns = container.querySelectorAll(`[data-transition-column]`)

	if (columns.length === 0) {
		navigate()

		return
	}

	container.style.pointerEvents = "auto"

	gsap.killTweensOf(columns)
	gsap.set(columns, { yPercent: -100 })

	gsap.to(columns, {
		yPercent: 0,
		duration: 0.8,
		stagger: 0.1,
		ease: "power4.inOut",
		onComplete: () => {
			setIsTransitionComplete(false)
			navigate()
		},
	})
}
