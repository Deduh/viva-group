"use client"

import { usePageTransition } from "@/context/PageTransitionContext"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useCallback } from "react"
import { navigateWithTransition } from "./navigate-with-transition"

interface TransitionLinkProps
	extends
		LinkProps,
		Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	children: ReactNode
	className?: string
}

export const TransitionLink = forwardRef<
	HTMLAnchorElement,
	TransitionLinkProps
>(function TransitionLink(
	{ href, children, className, onClick, ...props },
	ref,
) {
	const router = useRouter()
	const { setIsTransitionComplete } = usePageTransition()

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(e)

			if (e.defaultPrevented) return

			e.preventDefault()
			navigateWithTransition(
				router,
				href.toString(),
				setIsTransitionComplete,
				"push",
			)
		},
		[href, onClick, router, setIsTransitionComplete],
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
