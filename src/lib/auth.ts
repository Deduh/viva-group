import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { env } from "./env/server"
import type { Role } from "./roles"

export const authSecret = env.NEXTAUTH_SECRET

type AuthResponse = {
	user: {
		id: string
		email: string
		name?: string
		role: Role
	}
	tokens: {
		accessToken: string
		refreshToken: string
		accessExpiresIn?: string | number
		refreshExpiresIn?: string | number
	}
}

const apiBaseUrl =
	env.AUTH_API_URL ||
	env.NEXT_PUBLIC_API_URL ||
	env.APP_URL ||
	env.NEXTAUTH_URL ||
	"http://localhost:3000"

const parseExpiresIn = (value?: string | number) => {
	if (!value) return 0
	if (typeof value === "number") return value * 1000
	if (/^\d+$/.test(value)) return Number(value) * 1000

	const match = value.match(/^(\d+)\s*(ms|s|m|h|d)$/i)

	if (!match) return 0

	const amount = Number(match[1])
	const unit = match[2].toLowerCase()

	switch (unit) {
		case "ms":
			return amount
		case "s":
			return amount * 1000
		case "m":
			return amount * 60 * 1000
		case "h":
			return amount * 60 * 60 * 1000
		case "d":
			return amount * 24 * 60 * 60 * 1000
		default:
			return 0
	}
}

const refreshAccessToken = async (token: {
	accessToken?: string
	refreshToken?: string
}) => {
	if (!token.refreshToken) {
		return { ...token, error: "MissingRefreshToken" }
	}

	try {
		const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: token.refreshToken }),
		})

		if (!response.ok) {
			return { ...token, error: "RefreshAccessTokenError" }
		}

		const data = (await response.json()) as AuthResponse
		const accessExpiresIn = parseExpiresIn(data.tokens.accessExpiresIn) || 0
		const refreshExpiresIn = parseExpiresIn(data.tokens.refreshExpiresIn) || 0

		return {
			...token,
			accessToken: data.tokens.accessToken,
			refreshToken: data.tokens.refreshToken,
			accessTokenExpires: Date.now() + accessExpiresIn,
			refreshTokenExpires: Date.now() + refreshExpiresIn,
			error: undefined,
		}
	} catch {
		return { ...token, error: "RefreshAccessTokenError" }
	}
}

export const authOptions: NextAuthOptions = {
	secret: authSecret,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) return null

				const res = await fetch(`${apiBaseUrl}/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: credentials.email,
						password: credentials.password,
					}),
				})

				if (!res.ok) return null

				const data = (await res.json()) as AuthResponse

				if (!data?.user || !data.tokens?.accessToken) return null

				return {
					id: data.user.id,
					email: data.user.email,
					name: data.user.name,
					role: data.user.role ?? "CLIENT",
					accessToken: data.tokens.accessToken,
					refreshToken: data.tokens.refreshToken,
					accessExpiresIn: data.tokens.accessExpiresIn,
					refreshExpiresIn: data.tokens.refreshExpiresIn,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.role = (user as { role?: Role }).role ?? "CLIENT"
				token.accessToken = (user as { accessToken?: string }).accessToken
				token.refreshToken = (user as { refreshToken?: string }).refreshToken

				const accessExpiresIn = parseExpiresIn(
					(user as { accessExpiresIn?: string | number }).accessExpiresIn,
				)
				const refreshExpiresIn = parseExpiresIn(
					(user as { refreshExpiresIn?: string | number }).refreshExpiresIn,
				)

				token.accessTokenExpires = Date.now() + accessExpiresIn
				token.refreshTokenExpires = Date.now() + refreshExpiresIn
			}

			if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
				return token
			}

			const refreshed = await refreshAccessToken(token)

			return { ...token, ...refreshed }
		},
		async session({ session, token }) {
			if (session.user && token) {
				;(session.user as { id?: string }).id = token.id as string
				;(session.user as { role?: Role }).role =
					(token.role as Role) ?? "CLIENT"
			}

			session.accessToken = token.accessToken
			session.accessTokenExpires = token.accessTokenExpires
			session.error = token.error as string | undefined

			return session
		},
	},
}
