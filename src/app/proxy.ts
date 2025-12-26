import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getToken } from "next-auth/jwt"

import { authSecret } from "@/lib/auth"
import { env } from "@/lib/env"
import type { Role } from "@/lib/roles"

type TokenWithRole = {
	role?: Role
	email?: string
	name?: string
}

const PUBLIC_PREFIXES = [
	"/",
	"/tours",
	"/group",
	"/contacts",
	"/api/auth",
	"/api/tours",
	"/api/bookings",
]

const PROTECTED_PREFIXES = ["/admin", "/manager", "/client", "/support"]

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (
		PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
		pathname.startsWith("/_next/") ||
		pathname === "/favicon.ico" ||
		pathname === "/robots.txt" ||
		pathname === "/sitemap.xml" ||
		pathname === "/site.webmanifest" ||
		pathname.startsWith("/api/")
	) {
		return NextResponse.next()
	}

	const token = (await getToken({
		req: request,
		secret: authSecret,
	})) as TokenWithRole | null

	if (["/login", "/register"].includes(pathname) && token) {
		const role = token.role
		let redirectPath = "/client/tours"

		if (role === "ADMIN") {
			redirectPath = "/admin/tours"
		} else if (role === "MANAGER") {
			redirectPath = "/manager/tours"
		}

		return NextResponse.redirect(new URL(redirectPath, request.url))
	}

	const isProtected = PROTECTED_PREFIXES.some(prefix =>
		pathname.startsWith(prefix)
	)

	if (isProtected) {
		if (!token) {
			const loginUrl = new URL("/login", request.url)
			loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url))
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

	if (env.NODE_ENV === "development" && token) {
		console.log(
			`[Proxy] ${pathname} - User: ${token.email}, Role: ${token.role}`
		)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)",
	],
}
