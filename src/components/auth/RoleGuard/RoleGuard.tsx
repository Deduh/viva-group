"use client"

import { useAuth } from "@/hooks/useAuth"
import type { Role } from "@/lib/roles"
import type { ReactNode } from "react"

type RoleGuardProps = {
	children: ReactNode
	allowedRoles: Role[]
	fallback?: ReactNode
	requireAll?: boolean
}

export function RoleGuard({
	children,
	allowedRoles,
	fallback = null,
	requireAll = false,
}: RoleGuardProps) {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return null
	}

	if (!user) {
		return <>{fallback}</>
	}

	const hasAccess = requireAll
		? allowedRoles.every(role => user.role === role)
		: allowedRoles.includes(user.role)

	if (!hasAccess) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

export function AuthGuard({
	children,
	fallback = null,
}: {
	children: ReactNode
	fallback?: ReactNode
}) {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return null
	}

	if (!isAuthenticated) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

export function GuestGuard({
	children,
	fallback = null,
}: {
	children: ReactNode
	fallback?: ReactNode
}) {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return null
	}

	if (isAuthenticated) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

export function AdminGuard({
	children,
	fallback = null,
}: {
	children: ReactNode
	fallback?: ReactNode
}) {
	return (
		<RoleGuard allowedRoles={["ADMIN"]} fallback={fallback}>
			{children}
		</RoleGuard>
	)
}

export function ManagerGuard({
	children,
	fallback = null,
}: {
	children: ReactNode
	fallback?: ReactNode
}) {
	return (
		<RoleGuard allowedRoles={["MANAGER", "ADMIN"]} fallback={fallback}>
			{children}
		</RoleGuard>
	)
}
