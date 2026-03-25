import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

import { env } from "./env/server"
import type { Role } from "./roles"

export const authSecret = env.NEXTAUTH_SECRET
const ACCESS_TOKEN_FALLBACK_MS = 15 * 60 * 1000
const REFRESH_TOKEN_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

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

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
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
		const accessExpiresIn =
			parseExpiresIn(data.tokens.accessExpiresIn) || ACCESS_TOKEN_FALLBACK_MS
		const refreshExpiresIn =
			parseExpiresIn(data.tokens.refreshExpiresIn) || REFRESH_TOKEN_FALLBACK_MS

		return {
			...token,
			id: data.user.id ?? token.id,
			email: data.user.email ?? token.email,
			name: data.user.name ?? token.name,
			role: data.user.role ?? token.role ?? "CLIENT",
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
		maxAge: SESSION_MAX_AGE_SECONDS,
	},
	jwt: {
		maxAge: SESSION_MAX_AGE_SECONDS,
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
				recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
				recaptchaAction: { label: "reCAPTCHA Action", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) return null

				const recaptchaToken =
					typeof credentials.recaptchaToken === "string"
						? credentials.recaptchaToken
						: undefined
				const recaptchaAction =
					typeof credentials.recaptchaAction === "string"
						? credentials.recaptchaAction
						: undefined

				const res = await fetch(`${apiBaseUrl}/auth/login`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(recaptchaToken
							? {
									"X-Recaptcha-Token": recaptchaToken,
									"X-Recaptcha-Action":
										recaptchaAction || "login_submit",
								}
							: {}),
					},
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
		async jwt({ token, user, trigger }) {
			if (user) {
				token.id = user.id
				token.email = user.email
				token.name = user.name
				token.role = (user as { role?: Role }).role ?? "CLIENT"
				token.accessToken = (user as { accessToken?: string }).accessToken
				token.refreshToken = (user as { refreshToken?: string }).refreshToken

				const accessExpiresIn = parseExpiresIn(
					(user as { accessExpiresIn?: string | number }).accessExpiresIn,
				)
				const refreshExpiresIn = parseExpiresIn(
					(user as { refreshExpiresIn?: string | number }).refreshExpiresIn,
				)

				token.accessTokenExpires =
					Date.now() + (accessExpiresIn || ACCESS_TOKEN_FALLBACK_MS)
				token.refreshTokenExpires =
					Date.now() + (refreshExpiresIn || REFRESH_TOKEN_FALLBACK_MS)
			}

			if (trigger === "update") {
				return refreshAccessToken(token)
			}

			if (
				token.refreshTokenExpires &&
				Date.now() >= token.refreshTokenExpires
			) {
				return {
					...token,
					accessToken: undefined,
					refreshToken: undefined,
					accessTokenExpires: undefined,
					refreshTokenExpires: undefined,
					error: "RefreshTokenExpired",
				}
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
				session.user.email = token.email as string
				session.user.name = (token.name as string | null | undefined) ?? null
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
