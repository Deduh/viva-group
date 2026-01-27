import { z } from "zod"

export const tourCreateInputSchema = z.object({
	title: z
		.string()
		.min(1, "Название тура обязательно")
		.max(200, "Слишком длинно"),
	shortDescription: z
		.string()
		.min(1, "Краткое описание обязательно")
		.max(500, "Краткое описание слишком длинное"),
	fullDescriptionBlocks: z
		.array(
			z.object({
				title: z.string().min(1, "Заголовок блока обязателен"),
				items: z.array(z.string()).default([]),
			}),
		)
		.default([]),
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
			"URL изображения должен быть относительным путем или полным URL",
		),
	tags: z.array(z.string()).default([]),
	categories: z.array(z.string()).default([]),
	dateFrom: z.string().optional().or(z.literal("")),
	dateTo: z.string().optional().or(z.literal("")),
	durationDays: z
		.number()
		.int("Длительность (дни) должна быть целым числом")
		.positive("Длительность (дни) должна быть положительной")
		.optional()
		.or(z.literal("")),
	durationNights: z
		.number()
		.int("Длительность (ночи) должна быть целым числом")
		.positive("Длительность (ночи) должна быть положительной")
		.optional()
		.or(z.literal("")),
	available: z.boolean().default(true),
})

export const tourUpdateInputSchema = z.object({
	title: z.string().min(1, "Название тура обязательно").max(200).optional(),
	shortDescription: z
		.string()
		.min(1, "Краткое описание обязательно")
		.max(500, "Краткое описание слишком длинное")
		.optional(),
	fullDescriptionBlocks: z
		.array(
			z.object({
				title: z.string().min(1, "Заголовок блока обязателен"),
				items: z.array(z.string()).default([]),
			}),
		)
		.optional(),
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
			"URL изображения должен быть относительным путем или полным URL",
		)
		.optional(),
	tags: z.array(z.string()).optional(),
	categories: z.array(z.string()).optional(),
	dateFrom: z.string().optional().or(z.literal("")),
	dateTo: z.string().optional().or(z.literal("")),
	durationDays: z
		.number()
		.int("Длительность (дни) должна быть целым числом")
		.positive("Длительность (дни) должна быть положительной")
		.optional()
		.or(z.literal("")),
	durationNights: z
		.number()
		.int("Длительность (ночи) должна быть целым числом")
		.positive("Длительность (ночи) должна быть положительной")
		.optional()
		.or(z.literal("")),
	available: z.boolean().optional(),
})

export type TourCreateInput = z.infer<typeof tourCreateInputSchema>
export type TourUpdateInput = z.infer<typeof tourUpdateInputSchema>
