import { z } from "zod"

export const tourCreateInputSchema = z.object({
	destination: z
		.string()
		.min(1, "Название направления обязательно")
		.max(200, "Название слишком длинное"),
	shortDescription: z
		.string()
		.min(1, "Краткое описание обязательно")
		.max(500, "Краткое описание слишком длинное"),
	fullDescription: z
		.string()
		.max(5000, "Полное описание слишком длинное")
		.optional()
		.or(z.literal("")),
	properties: z.array(z.string()).default([]),
	price: z
		.number()
		.positive("Цена должна быть положительным числом")
		.min(0.01, "Цена должна быть больше 0"),
	image: z
		.string()
		.min(1, "URL изображения обязателен")
		.refine(
			val =>
				val.startsWith("/") ||
				val.startsWith("http://") ||
				val.startsWith("https://"),
			"URL изображения должен быть относительным путем или полным URL"
		),
	tags: z.array(z.string()).default([]),
	rating: z
		.number()
		.min(0, "Рейтинг не может быть отрицательным")
		.max(5, "Рейтинг должен быть от 0 до 5")
		.default(0),
	duration: z
		.number()
		.int("Длительность должна быть целым числом")
		.positive("Длительность должна быть положительным числом")
		.optional()
		.or(z.literal("")),
	maxPartySize: z
		.number()
		.int("Максимальное количество участников должно быть целым числом")
		.positive("Максимальное количество участников должно быть положительным")
		.optional()
		.or(z.literal("")),
	minPartySize: z
		.number()
		.int("Минимальное количество участников должно быть целым числом")
		.positive("Минимальное количество участников должно быть положительным")
		.optional()
		.or(z.literal("")),
	available: z.boolean().default(true),
})

export const tourUpdateInputSchema = z.object({
	destination: z
		.string()
		.min(1, "Название направления обязательно")
		.max(200, "Название слишком длинное")
		.optional(),
	shortDescription: z
		.string()
		.min(1, "Краткое описание обязательно")
		.max(500, "Краткое описание слишком длинное")
		.optional(),
	fullDescription: z
		.string()
		.max(5000, "Полное описание слишком длинное")
		.optional()
		.or(z.literal("")),
	properties: z.array(z.string()).optional(),
	price: z
		.number()
		.positive("Цена должна быть положительным числом")
		.min(0.01, "Цена должна быть больше 0")
		.optional(),
	image: z
		.string()
		.min(1, "URL изображения обязателен")
		.refine(
			val =>
				val.startsWith("/") ||
				val.startsWith("http://") ||
				val.startsWith("https://"),
			"URL изображения должен быть относительным путем или полным URL"
		)
		.optional(),
	tags: z.array(z.string()).optional(),
	rating: z
		.number()
		.min(0, "Рейтинг не может быть отрицательным")
		.max(5, "Рейтинг должен быть от 0 до 5")
		.optional(),
	duration: z
		.number()
		.int("Длительность должна быть целым числом")
		.positive("Длительность должна быть положительным числом")
		.optional()
		.or(z.literal("")),
	maxPartySize: z
		.number()
		.int("Максимальное количество участников должно быть целым числом")
		.positive("Максимальное количество участников должно быть положительным")
		.optional()
		.or(z.literal("")),
	minPartySize: z
		.number()
		.int("Минимальное количество участников должно быть целым числом")
		.positive("Минимальное количество участников должно быть положительным")
		.optional()
		.or(z.literal("")),
	available: z.boolean().optional(),
})

export type TourCreateInput = z.infer<typeof tourCreateInputSchema>
export type TourUpdateInput = z.infer<typeof tourUpdateInputSchema>
