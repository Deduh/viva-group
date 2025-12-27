"use client"

import { usePreloader } from "@/context/PreloaderContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useLenis } from "lenis/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import s from "./Preloader.module.scss"

const TIMINGS = {
	MIN_DISPLAY: 1500,
	MAX_WAIT: 10000,
	STATIC_REPLACE_DELAY: 50,
	LENIS_TIMEOUT: 2000,
} as const

type AnimationElements = {
	container: HTMLDivElement
	logo: HTMLDivElement
}

type AnimationOptions = {
	onComplete?: () => void
	skipInitialAnimation?: boolean
}

function createPreloaderAnimation(
	elements: AnimationElements,
	options: AnimationOptions = {}
): gsap.core.Timeline {
	const { container, logo } = elements
	const { onComplete, skipInitialAnimation = false } = options

	const tl = gsap.timeline({
		onComplete,
	})

	if (!skipInitialAnimation) {
		tl.to(logo, {
			y: 0,
			opacity: 1,
			scale: 1,
			duration: 1,
			ease: "power3.out",
			delay: 0.2,
		})
	}

	tl.to(container, {
			yPercent: -100,
			duration: 1.2,
			ease: "expo.inOut",
		})
		.to(
			logo,
			{
				y: -200,
				duration: 1.2,
				ease: "expo.inOut",
			},
			"<"
		)

	return tl
}

export function Preloader() {
	const container = useRef<HTMLDivElement>(null)
	const logoRef = useRef<HTMLDivElement>(null)
	const { isLoaded, setIsLoaded, shouldShowPreloader } = usePreloader()
	const lenis = useLenis()

	const [resourcesLoaded, setResourcesLoaded] = useState(false)
	const [animationStarted, setAnimationStarted] = useState(false)
	const startTimeRef = useRef<number | null>(null)

	useEffect(() => {
		if (startTimeRef.current === null) {
			startTimeRef.current = Date.now()
		}
	}, [])

	useEffect(() => {
		if (!shouldShowPreloader) {
			setIsLoaded(true)
		}
	}, [shouldShowPreloader, setIsLoaded])

	useEffect(() => {
		if (!shouldShowPreloader) return

		const checkResources = async () => {
			try {
				if (document.readyState !== "complete") {
					await new Promise<void>(resolve => {
						if (document.readyState === "complete") {
							resolve()
						} else {
							window.addEventListener("load", () => resolve(), { once: true })
						}
					})
				}

				await document.fonts.ready

				const criticalImages = document.querySelectorAll<HTMLImageElement>(
					'img[data-priority="true"], img[loading="eager"]'
				)

				if (criticalImages.length > 0) {
					await Promise.all(
						Array.from(criticalImages).map(
							img =>
								new Promise<void>(resolve => {
									if (img.complete) {
										resolve()
									} else {
										img.addEventListener("load", () => resolve(), {
											once: true,
										})

										img.addEventListener("error", () => resolve(), {
											once: true,
										})
									}
								})
						)
					)
				}

				setResourcesLoaded(true)
			} catch (error) {
				console.error("Ошибка при проверке ресурсов:", error)
				setResourcesLoaded(true)
			}
		}

		const timeout = setTimeout(() => {
			setResourcesLoaded(true)
		}, TIMINGS.MAX_WAIT)

		checkResources().then(() => {
			clearTimeout(timeout)
		})

		return () => clearTimeout(timeout)
	}, [shouldShowPreloader])

	useGSAP(
		() => {
			if (!shouldShowPreloader || !logoRef.current) return

			gsap.to(logoRef.current, {
				y: 0,
				opacity: 1,
				scale: 1,
				duration: 1,
				ease: "power3.out",
				delay: 0.2,
			})
		},
		{
			scope: container,
			dependencies: [shouldShowPreloader],
		}
	)

	useGSAP(
		() => {
			if (!shouldShowPreloader || !container.current) return

			const selector = gsap.utils.selector(container)
			const logo = selector(`.${s.logoImage}`)[0] as HTMLElement | undefined

			if (!logo) return

			gsap.set(logo, { transformOrigin: "center" })

			const pulse = gsap.to(logo, {
				scale: 1.06,
				duration: 1.2,
				yoyo: true,
				repeat: -1,
				ease: "sine.inOut",
				delay: 0.4,
			})

			return () => {
				pulse.kill()
			}
		},
		{
			scope: container,
			dependencies: [shouldShowPreloader],
		}
	)

	useGSAP(
		() => {
			if (!lenis || !resourcesLoaded || !shouldShowPreloader) return
			if (startTimeRef.current === null) return
			if (animationStarted) return

			const elapsed = Date.now() - startTimeRef.current
			const remainingTime = Math.max(0, TIMINGS.MIN_DISPLAY - elapsed)

			setAnimationStarted(true)

			lenis.scrollTo(0, { immediate: true })
			lenis.stop()

			if (!container.current || !logoRef.current) return

			const tl = createPreloaderAnimation(
				{
					container: container.current,
					logo: logoRef.current,
				},
				{
					skipInitialAnimation: true,
					onComplete: () => {
						setIsLoaded(true)
						lenis.start()

						if (container.current) {
							gsap.to(container.current, {
								opacity: 0,
								duration: 0.1,
								onComplete: () => {
									container.current?.remove()
								},
							})
						}
					},
				}
			)

			tl.delay(remainingTime / 1000)
		},
		{
			scope: container,
			dependencies: [
				lenis,
				resourcesLoaded,
				shouldShowPreloader,
				animationStarted,
			],
		}
	)

	useEffect(() => {
		if (!shouldShowPreloader) return

		const timeout = setTimeout(() => {
			if (!lenis && !animationStarted && resourcesLoaded) {
				console.warn("Lenis не загрузился, продолжаем без него")

				if (container.current && logoRef.current) {
					createPreloaderAnimation(
						{
							container: container.current,
							logo: logoRef.current,
						},
						{
							skipInitialAnimation: true,
							onComplete: () => {
								setIsLoaded(true)
								if (container.current) {
									container.current.remove()
								}
							},
						}
					)
				}
			}
		}, TIMINGS.LENIS_TIMEOUT)

		return () => clearTimeout(timeout)
	}, [
		lenis,
		animationStarted,
		resourcesLoaded,
		shouldShowPreloader,
		setIsLoaded,
	])

	useEffect(() => {
		if (!shouldShowPreloader) return

		const fallbackTimeout = setTimeout(() => {
			if (!isLoaded && !animationStarted) {
				console.warn(
					"Прелоадер превысил время ожидания, принудительно скрываем с анимацией"
				)

				if (container.current && logoRef.current) {
					createPreloaderAnimation(
						{
							container: container.current,
							logo: logoRef.current,
						},
						{
							skipInitialAnimation: true,
							onComplete: () => {
								setIsLoaded(true)

								if (lenis) lenis.start()

								if (container.current) {
									container.current.remove()
								}
							},
						}
					)
				} else {
					setIsLoaded(true)

					if (lenis) lenis.start()
				}
			}
		}, TIMINGS.MAX_WAIT)

		return () => clearTimeout(fallbackTimeout)
	}, [isLoaded, lenis, shouldShowPreloader, setIsLoaded, animationStarted])

	useEffect(() => {
		const staticPreloader = document.getElementById("__preloader")

		if (!staticPreloader) return

		if (!shouldShowPreloader) {
			staticPreloader.remove()

			return
		}

		if (container.current) {
			const timer = setTimeout(() => {
				gsap.to(staticPreloader, {
					opacity: 0,
					duration: 0.2,
					ease: "power2.out",
					onComplete: () => {
						staticPreloader.remove()
					},
				})
			}, TIMINGS.STATIC_REPLACE_DELAY)

			return () => clearTimeout(timer)
		}
	}, [shouldShowPreloader])

	if (!shouldShowPreloader) {
		return null
	}

	return (
		<div ref={container} className={s.preloader}>
			<div ref={logoRef} className={s.logoWrapper}>
				<Image
					src="/viva-logo.webp"
					alt="Viva Tour"
					className={s.logoImage}
					fill
				/>
			</div>
		</div>
	)
}
