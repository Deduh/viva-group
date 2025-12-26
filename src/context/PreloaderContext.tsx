"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type PreloaderContextType = {
	isLoaded: boolean
	setIsLoaded: (value: boolean) => void
	shouldShowPreloader: boolean
}

const PreloaderContext = createContext<PreloaderContextType>({
	isLoaded: false,
	setIsLoaded: () => {},
	shouldShowPreloader: true,
})

export const usePreloader = () => useContext(PreloaderContext)

export const PreloaderProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const [isLoaded, setIsLoaded] = useState(() => {
		if (typeof window === "undefined") return false

		return sessionStorage.getItem("preloader-shown") === "true"
	})

	const shouldShowPreloader = !isLoaded

	useEffect(() => {
		if (isLoaded && typeof window !== "undefined") {
			sessionStorage.setItem("preloader-shown", "true")
		}
	}, [isLoaded])

	return (
		<PreloaderContext.Provider
			value={{ isLoaded, setIsLoaded, shouldShowPreloader }}
		>
			{children}
		</PreloaderContext.Provider>
	)
}
