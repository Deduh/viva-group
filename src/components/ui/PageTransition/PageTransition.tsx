"use client"

import { usePageTransition } from "@/context/PageTransitionContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"
import s from "./PageTransition.module.scss"

export function PageTransition() {
	const containerRef = useRef<HTMLDivElement>(null)
	const pathname = usePathname()
	const prevPathnameRef = useRef<string | null>(null)
	const { setIsTransitionComplete } = usePageTransition()
	const lenis = useLenis()

	useLayoutEffect(() => {
		if (!containerRef.current) return

		const columns = containerRef.current.querySelectorAll(
			`[data-transition-column]`
		)

		if (columns.length === 0) return

		gsap.set(columns, { yPercent: -100, visibility: "visible" })

		requestAnimationFrame(() => {
			setIsTransitionComplete(true)
		})
	}, [setIsTransitionComplete])

	useGSAP(
		() => {
			if (!containerRef.current) return

			const columns = containerRef.current.querySelectorAll(
				`[data-transition-column]`
			)

			if (columns.length === 0) return

			if (prevPathnameRef.current === null) {
				prevPathnameRef.current = pathname

				return
			}

			if (prevPathnameRef.current !== pathname) {
				const oldPathname = prevPathnameRef.current
				prevPathnameRef.current = pathname

				const adminRoutes = ["/admin", "/manager", "/client", "/support"]
				const isAdminRoute = (path: string) =>
					adminRoutes.some(route => path.startsWith(route))

				const isPrevAdmin = isAdminRoute(oldPathname)
				const isCurrentAdmin = isAdminRoute(pathname)

				if (isPrevAdmin && isCurrentAdmin) {
					setIsTransitionComplete(true)
					return
				}

				if (lenis) {
					lenis.scrollTo(0, { immediate: true })
				}

				setIsTransitionComplete(false)

				gsap.killTweensOf(columns)

				gsap.to(columns, {
					yPercent: 100,
					duration: 0.8,
					stagger: 0.1,
					ease: "power4.inOut",
					overwrite: "auto",
					onComplete: () => {
						if (containerRef.current) {
							containerRef.current.style.pointerEvents = "none"
						}

						requestAnimationFrame(() => {
							requestAnimationFrame(() => {
								setIsTransitionComplete(true)
							})
						})
					},
				})
			}
		},
		{
			scope: containerRef,
			dependencies: [pathname, setIsTransitionComplete, lenis],
		}
	)

	return (
		<div
			id="page-transition-container"
			ref={containerRef}
			className={s.container}
		>
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} data-transition-column className={s.column} />
			))}
		</div>
	)
}
