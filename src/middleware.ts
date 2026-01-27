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

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const isPublic =
		PUBLIC_ROUTES.has(pathname) ||
		PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))

	if (pathname.startsWith("/api/")) {
		if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
			return NextResponse.next()
		}

		if (
			pathname.startsWith("/api/tours") &&
			PUBLIC_API_METHODS.has(request.method)
		) {
			return NextResponse.next()
		}

		const token = (await getToken({
			req: request,
			secret: authSecret,
		})) as TokenWithRole | null

		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		if (
			pathname.startsWith("/api/tours") &&
			WRITE_METHODS.has(request.method) &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		if (
			pathname.startsWith("/api/uploads") &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		if (
			ADMIN_API_PREFIXES.some(prefix => pathname.startsWith(prefix)) &&
			token.role !== "ADMIN"
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		if (
			MANAGER_API_PREFIXES.some(prefix => pathname.startsWith(prefix)) &&
			token.role !== "ADMIN" &&
			token.role !== "MANAGER"
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 })
		}

		return NextResponse.next()
	}

	if (pathname === "/login" || pathname === "/register") {
		const token = (await getToken({
			req: request,
			secret: authSecret,
		})) as TokenWithRole | null

		if (!token) {
			return NextResponse.next()
		}

		const role = token.role
		let redirectPath = "/client/tours"

		if (role === "ADMIN") {
			redirectPath = "/admin/tours"
		} else if (role === "MANAGER") {
			redirectPath = "/manager/tours"
		}

		return NextResponse.redirect(new URL(redirectPath, request.url))
	}

	if (isPublic) return NextResponse.next()

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

			return NextResponse.redirect(loginUrl)
		}

		const role = token.role

		if (pathname.startsWith("/admin") && role !== "ADMIN") {
			return NextResponse.redirect(new URL("/access-denied", request.url))
		}

		if (pathname.startsWith("/manager")) {
			if (role !== "ADMIN" && role !== "MANAGER") {
				return NextResponse.redirect(new URL("/access-denied", request.url))
			}
		}

		if (pathname.startsWith("/client") && role !== "CLIENT") {
			return NextResponse.redirect(new URL("/access-denied", request.url))
		}
	}

	if (process.env.NODE_ENV === "development" && token) {
		console.log(
			`[Middleware] ${pathname} - User: ${token.email}, Role: ${token.role}`,
		)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
	],
}
