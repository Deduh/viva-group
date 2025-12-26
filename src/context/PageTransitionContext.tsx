"use client"

import { createContext, ReactNode, useContext, useState } from "react"

interface PageTransitionContextType {
	isTransitionComplete: boolean
	setIsTransitionComplete: (value: boolean) => void
}

const PageTransitionContext = createContext<
	PageTransitionContextType | undefined
>(undefined)

export function PageTransitionProvider({ children }: { children: ReactNode }) {
	const [isTransitionComplete, setIsTransitionComplete] = useState(false)

	return (
		<PageTransitionContext.Provider
			value={{ isTransitionComplete, setIsTransitionComplete }}
		>
			{children}
		</PageTransitionContext.Provider>
	)
}

export function usePageTransition() {
	const context = useContext(PageTransitionContext)

	if (context === undefined) {
		throw new Error(
			"usePageTransition must be used within a PageTransitionProvider"
		)
	}

	return context
}
