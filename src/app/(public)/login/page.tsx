"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { LoginForm } from "@/components/pages/LoginPage"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Suspense, useRef } from "react"
import s from "./page.module.scss"

export default function LoginPage() {
	const containerRef = useRef<HTMLDivElement>(null)
	const { isTransitionComplete } = usePageTransition()

	useGSAP(
		() => {
			if (!containerRef.current || !isTransitionComplete) return

			const card = containerRef.current.querySelector("[data-login-card]")

			if (!card) return

			const tl = gsap.timeline()

			tl.to(
				card,
				{
					y: 0,
					autoAlpha: 1,
					duration: 0.8,
					ease: "power2.out",
					clearProps: "y",
				},
				0
			)

			return () => {
				tl.kill()
			}
		},
		{ scope: containerRef, dependencies: [isTransitionComplete] }
	)

	return (
		<PublicWrapper>
			<div ref={containerRef} className={s.page}>
				<Suspense fallback={null}>
					<LoginForm />
				</Suspense>
			</div>
		</PublicWrapper>
	)
}
