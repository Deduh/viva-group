import type { Role } from "./roles"

export const AGENT_APPLICATION_PATH = "/client/agent-application"

export function resolveSafeCallbackPath(
	rawCallbackUrl: string | null | undefined,
	origin: string,
) {
	if (!rawCallbackUrl) return null

	try {
		const resolved = new URL(rawCallbackUrl, origin)

		if (resolved.origin !== origin) {
			return null
		}

		return `${resolved.pathname}${resolved.search}${resolved.hash}`
	} catch {
		return null
	}
}

export function getRoleFallbackPath(role?: Role) {
	if (role === "ADMIN") return "/admin/tours"
	if (role === "MANAGER") return "/manager/tours"
	if (role === "AGENT") return "/agent/flights"

	return "/client/tours"
}

export function isCallbackAllowedForRole(callbackPath: string, role: Role) {
	if (callbackPath.startsWith("/admin")) return role === "ADMIN"

	if (callbackPath.startsWith("/manager")) {
		return role === "ADMIN" || role === "MANAGER"
	}

	if (callbackPath.startsWith("/agent")) return role === "AGENT"

	if (callbackPath.startsWith(AGENT_APPLICATION_PATH)) {
		return role === "CLIENT"
	}

	if (callbackPath.startsWith("/client")) {
		return role === "CLIENT" || role === "AGENT"
	}

	return true
}

export function getPostAuthTarget(
	role: Role | undefined,
	callbackPath: string | null | undefined,
) {
	const fallbackPath = getRoleFallbackPath(role)

	if (!role || !callbackPath) {
		return fallbackPath
	}

	return isCallbackAllowedForRole(callbackPath, role)
		? callbackPath
		: fallbackPath
}
