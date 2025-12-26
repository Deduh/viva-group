import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "./auth"
import type { Role } from "./roles"

export function isAuthenticated(session: Session | null): boolean {
	return !!session?.user
}

export function hasRole(session: Session | null, role: Role): boolean {
	if (!session?.user) return false

	return session.user.role === role
}

export function hasAnyRole(session: Session | null, roles: Role[]): boolean {
	if (!session?.user) return false
	return roles.includes(session.user.role)
}

export async function requireAuth(callbackUrl?: string) {
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		const url = callbackUrl
			? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
			: "/login"

		redirect(url)
	}

	return session
}

export async function requireRole(role: Role, redirectTo = "/access-denied") {
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		redirect("/login")
	}

	if (session.user.role !== role) {
		redirect(redirectTo)
	}

	return session
}

export async function requireAnyRole(
	roles: Role[],
	redirectTo = "/access-denied"
) {
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		redirect("/login")
	}

	if (!roles.includes(session.user.role)) {
		redirect(redirectTo)
	}

	return session
}

export async function getCurrentSession() {
	return await getServerSession(authOptions)
}

export async function getCurrentUser() {
	const session = await getServerSession(authOptions)

	return session?.user || null
}

export async function checkAuth() {
	const session = await getServerSession(authOptions)

	return {
		authorized: !!session?.user,
		session,
	}
}

export async function checkRole(role: Role) {
	const session = await getServerSession(authOptions)

	return {
		authorized: session?.user?.role === role,
		session,
	}
}

export async function checkAnyRole(roles: Role[]) {
	const session = await getServerSession(authOptions)

	return {
		authorized: session?.user ? roles.includes(session.user.role) : false,
		session,
	}
}
