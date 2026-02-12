"use client"

import { PageTransition } from "@/components/ui/PageTransition/PageTransition"
import { ClientPreloader } from "@/components/ui/Preloader/ClientPreloader"
import { PageTransitionProvider } from "@/context/PageTransitionContext"
import { PreloaderProvider } from "@/context/PreloaderContext"
import { queryClient } from "@/lib/query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import gsap from "gsap"
import { LenisRef, ReactLenis } from "lenis/react"
import { SessionProvider } from "next-auth/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Toaster } from "react-hot-toast"

interface Props {
	children: React.ReactNode
}

export function Providers({ children }: Props) {
	const lenisRef = useRef<LenisRef>(null)
	const [enableSmoothScroll, setEnableSmoothScroll] = useState(false)
	const lenisOptions = useMemo(() => {
		return {
			autoRaf: false,
			smoothWheel: true,
			syncTouch: false,
			syncTouchLerp: 0.075,
			touchInertiaExponent: 1.7,
			touchMultiplier: 1,
		}
	}, [])

	useEffect(() => {
		const media =
			typeof window !== "undefined"
				? window.matchMedia("(pointer: coarse), (max-width: 768px)")
				: null

		if (!media) return

		const update = () => setEnableSmoothScroll(!media.matches)

		update()

		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", update)

			return () => media.removeEventListener("change", update)
		}

		return undefined
	}, [])

	useEffect(() => {
		if (!enableSmoothScroll) return

		function update(time: number) {
			lenisRef.current?.lenis?.raf(time * 1000)
		}

		gsap.ticker.add(update)
		gsap.ticker.lagSmoothing(0)

		return () => {
			gsap.ticker.remove(update)
		}
	}, [enableSmoothScroll])

	const appContent = (
		<>
			{children}

			<Toaster
				position="top-right"
				reverseOrder={false}
				gutter={8}
				toastOptions={{
					duration: 3000,
					style: {
						background: "rgba(255, 255, 255, 0.78)",
						backdropFilter: "blur(2.4rem) saturate(180%)",
						WebkitBackdropFilter: "blur(2.4rem) saturate(180%)",
						border: "0.1rem solid rgba(255, 255, 255, 0.65)",
						boxShadow:
							"0 1.2rem 3.2rem rgba(15, 23, 42, 0.12), 0 0 0 0.1rem rgba(255, 255, 255, 0.7) inset",
						borderRadius: "2rem",
						padding: "1.6rem 1.8rem",
						fontSize: "1.4rem",
						fontWeight: 600,
						color: "#0f172a",
					},
				}}
			/>
		</>
	)

	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>
				<PreloaderProvider>
					<PageTransitionProvider>
						<ClientPreloader />
						<PageTransition />

						{enableSmoothScroll ? (
							<ReactLenis ref={lenisRef} root options={lenisOptions}>
								{appContent}
							</ReactLenis>
						) : (
							appContent
						)}
					</PageTransitionProvider>
				</PreloaderProvider>
			</QueryClientProvider>
		</SessionProvider>
	)
}
