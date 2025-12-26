"use client"

import type { Role } from "@/lib/roles"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useAuth() {
	const { data: session, status } = useSession()
	const router = useRouter()

	const user = session?.user
	const isAuthenticated = !!session?.user
	const isLoading = status === "loading"
	const accessToken = session?.accessToken

	const hasRole = useCallback(
		(role: Role): boolean => {
			if (!user) return false

			return user.role === role
		},
		[user]
	)

	const hasAnyRole = useCallback(
		(roles: Role[]): boolean => {
			if (!user) return false

			return roles.includes(user.role)
		},
		[user]
	)

	const isAdmin = useCallback((): boolean => {
		return hasRole("ADMIN")
	}, [hasRole])

	const isManager = useCallback((): boolean => {
		return hasAnyRole(["MANAGER", "ADMIN"])
	}, [hasAnyRole])

	const requireAuth = useCallback(
		(callbackUrl?: string) => {
			if (!isAuthenticated && !isLoading) {
				const url = callbackUrl
					? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
					: "/login"

				router.push(url)
			}
		},
		[isAuthenticated, isLoading, router]
	)

	const requireRole = useCallback(
		(role: Role, redirectTo = "/access-denied") => {
			if (!isLoading) {
				if (!isAuthenticated) {
					router.push("/login")
				} else if (!hasRole(role)) {
					router.push(redirectTo)
				}
			}
		},
		[isLoading, isAuthenticated, hasRole, router]
	)

	const requireAnyRole = useCallback(
		(roles: Role[], redirectTo = "/access-denied") => {
			if (!isLoading) {
				if (!isAuthenticated) {
					router.push("/login")
				} else if (!hasAnyRole(roles)) {
					router.push(redirectTo)
				}
			}
		},
		[isLoading, isAuthenticated, hasAnyRole, router]
	)

	return {
		user,
		isAuthenticated,
		isLoading,
		accessToken,
		hasRole,
		hasAnyRole,
		isAdmin,
		isManager,
		requireAuth,
		requireRole,
		requireAnyRole,
	}
}
