"use client"

import { usePageTransition } from "@/context/PageTransitionContext"
import gsap from "gsap"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useCallback } from "react"

interface TransitionLinkProps
	extends LinkProps,
		Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	children: ReactNode
	className?: string
}

export const TransitionLink = forwardRef<
	HTMLAnchorElement,
	TransitionLinkProps
>(function TransitionLink(
	{ href, children, className, onClick, ...props },
	ref
) {
	const router = useRouter()
	const { setIsTransitionComplete } = usePageTransition()

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(e)

			if (e.defaultPrevented) return

			e.preventDefault()

			const container = document.getElementById("page-transition-container")

			if (!container) {
				router.push(href.toString())

				return
			}

			const columns = container.querySelectorAll(`[data-transition-column]`)

			if (columns.length === 0) {
				router.push(href.toString())

				return
			}

			container.style.pointerEvents = "auto"

			gsap.set(columns, { yPercent: -100 })

			gsap.to(columns, {
				yPercent: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: "power4.inOut",
				onComplete: () => {
					setIsTransitionComplete(false)
					router.push(href.toString())
				},
			})
		},
		[href, onClick, router, setIsTransitionComplete]
	)

	return (
		<Link
			ref={ref}
			href={href}
			className={className}
			onClick={handleClick}
			{...props}
		>
			{children}
		</Link>
	)
})
