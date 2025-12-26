"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { RegisterForm } from "@/components/pages/RegisterPage"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Suspense, useRef } from "react"
import styles from "./page.module.scss"

export default function RegisterPage() {
	const containerRef = useRef<HTMLDivElement>(null)
	const { isTransitionComplete } = usePageTransition()

	useGSAP(
		() => {
			if (!containerRef.current || !isTransitionComplete) return

			const card = containerRef.current.querySelector("[data-register-card]")

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
			<div ref={containerRef} className={styles.page}>
				<Suspense fallback={null}>
					<RegisterForm />
				</Suspense>
			</div>
		</PublicWrapper>
	)
}
