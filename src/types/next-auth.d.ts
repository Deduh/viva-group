import type { Role } from "@/lib/roles"
import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
	interface Session {
		user: DefaultSession["user"] & {
			id: string
			role: Role
			email: string
		}
		accessToken?: string
		accessTokenExpires?: number
		error?: string
	}

	interface User extends DefaultUser {
		id: string
		role: Role
		email: string
		name?: string | null
		image?: string | null
		accessToken?: string
		refreshToken?: string
		accessExpiresIn?: string | number
		refreshExpiresIn?: string | number
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		id: string
		role: Role
		email: string
		accessToken?: string
		refreshToken?: string
		accessTokenExpires?: number
		refreshTokenExpires?: number
		error?: string
	}
}
