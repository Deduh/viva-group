import { z } from "zod"

const currencyCodeSchema = z.enum(["RUB", "USD", "EUR", "CNY"])

const tourHotelInputSchema = z.object({
	name: z
		.string()
		.min(1, "Название отеля обязательно")
		.max(200, "Название отеля слишком длинное"),
	stars: z
		.number()
		.int("Количество звезд должно быть целым числом")
		.min(1, "Минимум 1 звезда")
		.max(5, "Максимум 5 звезд"),
	note: z
		.string()
		.max(300, "Комментарий к отелю слишком длинный")
		.optional()
		.or(z.literal("")),
	basePrice: z
		.number()
		.positive("Цена отеля должна быть положительной")
		.min(0.01, "Цена отеля должна быть больше 0"),
	baseCurrency: currencyCodeSchema.default("RUB"),
})

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
	programText: z
		.string()
		.max(20000, "Программа тура слишком длинная")
		.optional()
		.or(z.literal("")),
	price: z
		.number()
		.positive("Цена должна быть положительным числом")
		.min(0.01, "Цена должна быть больше 0"),
	baseCurrency: currencyCodeSchema.default("RUB"),
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
	hasHotelOptions: z.boolean().default(false),
	hotels: z.array(tourHotelInputSchema).default([]),
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
	programText: z
		.string()
		.max(20000, "Программа тура слишком длинная")
		.optional()
		.or(z.literal("")),
	price: z
		.number()
		.positive("Цена должна быть положительным числом")
		.min(0.01, "Цена должна быть больше 0")
		.optional(),
	baseCurrency: currencyCodeSchema.optional(),
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
	hasHotelOptions: z.boolean().optional(),
	hotels: z.array(tourHotelInputSchema).optional(),
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
