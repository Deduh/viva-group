import { z } from "zod"

const clientEnvSchema = z.object({
	NEXT_PUBLIC_API_URL: z.url().optional(),
	NEXT_PUBLIC_WS_URL: z.url().optional(),
	NEXT_PUBLIC_SITE_URL: z.url().optional(),
})

const env = clientEnvSchema.parse({
	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
	NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

export { env }
