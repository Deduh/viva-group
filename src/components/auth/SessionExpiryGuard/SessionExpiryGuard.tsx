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

		signOut({ redirect: false }).finally(() => {
			window.location.href = AUTH_ROUTES.has(pathname) ? pathname : "/login"
		})
	}, [pathname, session?.error, status])

	return null
}
