import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getToken } from "next-auth/jwt"

import { authSecret } from "@/lib/auth"
import type { Role } from "@/lib/roles"

type TokenWithRole = {
	role?: Role
	email?: string
	name?: string
}

const PUBLIC_ROUTES = new Set([
	"/",
	"/tours",
	"/group",
	"/cargo",
	"/contacts",
	"/privacy-policy",
	"/terms-of-service",
	"/login",
	"/register",
	"/access-denied",
	"/manifest.json",
])

const PUBLIC_PREFIXES = [
	"/tours/",
	"/group/",
	"/cargo/",
	"/contacts/",
	"/privacy-policy/",
	"/terms-of-service/",
]

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/contacts", "/api/mailing"]
const PUBLIC_API_METHODS = new Set(["GET", "HEAD"])
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

const PROTECTED_PREFIXES = ["/admin", "/manager", "/client", "/support"]
const ADMIN_API_PREFIXES = ["/api/admin"]
const MANAGER_API_PREFIXES = ["/api/manager"]

const SECURITY_HEADERS = {
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
	"X-Frame-Options": "DENY",
} as const

const createNonce = () => {
	const array = new Uint8Array(16)
	crypto.getRandomValues(array)

	return btoa(String.fromCharCode(...array))
}

const buildCsp = (nonce: string, isDev: boolean) => {
	const scriptSrc = [
		"'self'",
		`'nonce-${nonce}'`,
		isDev ? "'unsafe-eval'" : "",
	].filter(Boolean)

	const styleSrc = ["'self'", "'unsafe-inline'", "https:"].filter(Boolean)

	const connectSrc = [
		"'self'",
		"https:",
		"wss:",
		isDev ? "http:" : "",
		isDev ? "ws:" : "",
	].filter(Boolean)

	const imgSrc = [
		"'self'",
		"data:",
		"blob:",
		"https:",
		isDev ? "http:" : "",
	].filter(Boolean)

	const fontSrc = ["'self'", "data:", "https:"].filter(Boolean)

	const directives = [
		`default-src 'self'`,
		`base-uri 'self'`,
		`object-src 'none'`,
		`frame-ancestors 'none'`,
		`form-action 'self'`,
		`script-src ${scriptSrc.join(" ")}`,
		`style-src ${styleSrc.join(" ")}`,
		`img-src ${imgSrc.join(" ")}`,
		`font-src ${fontSrc.join(" ")}`,
		`connect-src ${connectSrc.join(" ")}`,
	]

	if (!isDev) {
		directives.push("upgrade-insecure-requests")
	}

	return directives.join("; ")
}

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const isDev = process.env.NODE_ENV === "development"
	const isApiRoute = pathname.startsWith("/api/")
	const isPageRequest =
		!isApiRoute && request.headers.get("accept")?.includes("text/html")

	const nonce = isPageRequest ? createNonce() : null
	const requestHeaders = new Headers(request.headers)

	if (nonce) {
		requestHeaders.set("x-nonce", nonce)
	}

	const applySecurityHeaders = (response: NextResponse) => {
		if (!nonce) return response

		const csp = buildCsp(nonce, isDev)
		response.headers.set("Content-Security-Policy", csp)

		Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
			response.headers.set(key, value)
		})

		return response
	}

	const nextWithHeaders = () =>
		applySecurityHeaders(
			NextResponse.next({
				request: {
					headers: requestHeaders,
				},
			}),
		)

	const isPublic =
		PUBLIC_ROUTES.has(pathname) ||
		PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))

	if (pathname.startsWith("/api/")) {
		if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
			return nextWithHeaders()
		}

		if (
			pathname.startsWith("/api/tours") &&
			PUBLIC_API_METHODS.has(request.method)
		) {
			return nextWithHeaders()
		}

		const token = (await getToken({
			req: request,
			secret: authSecret,
		})) as TokenWithRole | null

		if (!token) {
			return applySecurityHeaders(
				NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
			)
		}

		if (
			pathname.startsWith("/api/tours") &&
			WRITE_METHODS.has(request.method) &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return applySecurityHeaders(
				NextResponse.json({ error: "Forbidden" }, { status: 403 }),
			)
		}

		if (
			pathname.startsWith("/api/uploads") &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return applySecurityHeaders(
				NextResponse.json({ error: "Forbidden" }, { status: 403 }),
			)
		}

		if (
			ADMIN_API_PREFIXES.some(prefix => pathname.startsWith(prefix)) &&
			token.role !== "ADMIN"
		) {
			return applySecurityHeaders(
				NextResponse.json({ error: "Forbidden" }, { status: 403 }),
			)
		}

		if (
			MANAGER_API_PREFIXES.some(prefix => pathname.startsWith(prefix)) &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return applySecurityHeaders(
				NextResponse.json({ error: "Forbidden" }, { status: 403 }),
			)
		}

		return nextWithHeaders()
	}

	if (pathname === "/login" || pathname === "/register") {
		const token = (await getToken({
			req: request,
			secret: authSecret,
		})) as TokenWithRole | null

		if (!token) {
			return nextWithHeaders()
		}

		const role = token.role
		let redirectPath = "/client/tours"

		if (role === "ADMIN") {
			redirectPath = "/admin/tours"
		} else if (role === "MANAGER") {
			redirectPath = "/manager/tours"
		}

		return applySecurityHeaders(
			NextResponse.redirect(new URL(redirectPath, request.url)),
		)
	}

	if (isPublic) return nextWithHeaders()

	const token = (await getToken({
		req: request,
		secret: authSecret,
	})) as TokenWithRole | null

	const isProtected = PROTECTED_PREFIXES.some(prefix =>
		pathname.startsWith(prefix),
	)

	if (isProtected) {
		if (!token) {
			const loginUrl = new URL("/login", request.url)
			loginUrl.searchParams.set("callbackUrl", request.nextUrl.href)

			return applySecurityHeaders(NextResponse.redirect(loginUrl))
		}

		const role = token.role

		if (pathname.startsWith("/admin") && role !== "ADMIN") {
			return applySecurityHeaders(
				NextResponse.redirect(new URL("/access-denied", request.url)),
			)
		}

		if (pathname.startsWith("/manager")) {
			if (role !== "ADMIN" && role !== "MANAGER") {
				return applySecurityHeaders(
					NextResponse.redirect(new URL("/access-denied", request.url)),
				)
			}
		}

		if (pathname.startsWith("/client") && role !== "CLIENT") {
			return applySecurityHeaders(
				NextResponse.redirect(new URL("/access-denied", request.url)),
			)
		}
	}

	if (process.env.NODE_ENV === "development" && token) {
		console.log(
			`[Middleware] ${pathname} - User: ${token.email}, Role: ${token.role}`,
		)
	}

	return nextWithHeaders()
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
	],
}
