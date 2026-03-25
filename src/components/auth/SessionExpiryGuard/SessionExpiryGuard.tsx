"use client"

import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

const AUTH_ROUTES = new Set(["/login", "/register"])

export function SessionExpiryGuard() {
	const { data: session, status } = useSession()
	const pathname = usePathname()
	const signOutInFlightRef = useRef(false)

	useEffect(() => {
		if (status !== "authenticated") return
		if (!session?.error) return
		if (signOutInFlightRef.current) return

		signOutInFlightRef.current = true

		const container = document.getElementById("page-transition-container")
		const columns = container?.querySelectorAll(`[data-transition-column]`)

		if (container && columns?.length) {
			container.style.pointerEvents = "none"
		}

		signOut({ redirect: false }).finally(() => {
			window.location.replace(AUTH_ROUTES.has(pathname) ? pathname : "/login")
		})
	}, [pathname, session?.error, status])

	return null
}
