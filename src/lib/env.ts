import { z } from "zod"

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	NEXTAUTH_URL: z.url().optional(),
	NEXTAUTH_SECRET: z.string().min(1).optional(),
	APP_URL: z.url().optional(),
	NEXT_PUBLIC_API_URL: z.url().optional(),
	NEXT_PUBLIC_WS_URL: z.url().optional(),
	DATABASE_URL: z.string().url().optional(),
	AUTH_API_URL: z.string().url().optional(),
})

type EnvInput = {
	NODE_ENV?: string
	NEXTAUTH_URL?: string
	NEXTAUTH_SECRET?: string
	APP_URL?: string
	NEXT_PUBLIC_API_URL?: string
	NEXT_PUBLIC_WS_URL?: string
	DATABASE_URL?: string
	AUTH_API_URL?: string
}

function getEnv(): EnvInput {
	return {
		NODE_ENV: process.env.NODE_ENV,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		APP_URL: process.env.APP_URL,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		AUTH_API_URL: process.env.AUTH_API_URL,
	}
}

let env: z.infer<typeof envSchema>

try {
	env = envSchema.parse(getEnv())
} catch (error) {
	if (error instanceof z.ZodError) {
		const missingVars = error.issues
			.map(issue => `${issue.path.join(".")}: ${issue.message}`)
			.join("\n")

		throw new Error(
			`❌ Invalid environment variables:\n${missingVars}\n\n` +
				`Please check your .env file and ensure all required variables are set.`
		)
	}

	throw error
}

export { env }
