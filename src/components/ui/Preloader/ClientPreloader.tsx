"use client"

import { useEffect, useState } from "react"
import { Preloader } from "./Preloader"

export function ClientPreloader() {
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true)
		}, 0)

		return () => clearTimeout(timer)
	}, [])

	if (!isMounted) {
		return null
	}

	return <Preloader />
}
