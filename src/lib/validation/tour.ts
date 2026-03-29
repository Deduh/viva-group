import { z } from "zod"

const currencyCodeSchema = z.enum(["RUB", "USD", "EUR", "CNY"])

const optionalNumberInput = () =>
	z.preprocess(value => {
		if (value === "" || value === null || value === undefined) return undefined
		if (typeof value === "number") return Number.isNaN(value) ? undefined : value
		if (typeof value === "string") {
			const trimmed = value.trim()
			if (!trimmed) return undefined
			const numeric = Number(trimmed)
			return Number.isNaN(numeric) ? value : numeric
		}
		return value
	}, z.number().optional())

const positiveNumberInput = (requiredMessage: string, minMessage: string) =>
	optionalNumberInput().refine(
		value => value === undefined || value > 0,
		requiredMessage,
	).refine(value => value === undefined || value >= 0.01, minMessage)

const tourHotelInputSchema = z.object({
	id: z.string().optional(),
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
	supplementPrice: z
		.number()
		.positive("Доплата по отелю должна быть положительной")
		.min(0.01, "Доплата по отелю должна быть больше 0"),
	agentSupplementPrice: z
		.number()
		.positive("Агентская доплата должна быть положительной")
		.min(0.01, "Агентская доплата должна быть больше 0")
		.optional(),
	baseCurrency: currencyCodeSchema.default("RUB"),
})

const tourDepartureInputSchema = z
	.object({
		id: z.string().optional(),
		label: z
			.string()
			.max(120, "Название выезда слишком длинное")
			.optional()
			.or(z.literal("")),
		dateFrom: z.string().min(1, "Укажите дату начала выезда"),
		dateTo: z.string().min(1, "Укажите дату окончания выезда"),
		price: z
			.number()
			.positive("Цена выезда должна быть положительной")
			.min(0.01, "Цена выезда должна быть больше 0"),
		agentPrice: z
			.number()
			.positive("Агентская цена выезда должна быть положительной")
			.min(0.01, "Агентская цена выезда должна быть больше 0")
			.optional()
			.or(z.literal("")),
		available: z.boolean().default(true),
	})
	.refine(
		value => new Date(value.dateFrom).getTime() <= new Date(value.dateTo).getTime(),
		{
			message: "Дата начала выезда не может быть позже даты окончания",
			path: ["dateTo"],
		},
	)

const fullDescriptionBlocksSchema = z
	.array(
		z.object({
			title: z.string().min(1, "Заголовок блока обязателен"),
			items: z.array(z.string()).default([]),
		}),
	)
	.default([])

const createTourSchemaBase = z.object({
	title: z.string().min(1, "Название тура обязательно").max(200, "Слишком длинно"),
	shortDescription: z
		.string()
		.min(1, "Краткое описание обязательно")
		.max(500, "Краткое описание слишком длинное"),
	fullDescriptionBlocks: fullDescriptionBlocksSchema,
	programText: z
		.string()
		.max(20000, "Программа тура слишком длинная")
		.optional()
		.or(z.literal("")),
	price: positiveNumberInput(
		"Цена должна быть положительным числом",
		"Цена должна быть больше 0",
	).or(z.literal("")),
	agentPrice: positiveNumberInput(
		"Агентская цена должна быть положительным числом",
		"Агентская цена должна быть больше 0",
	).or(z.literal("")),
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
	departures: z.array(tourDepartureInputSchema).default([]),
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

export const tourCreateInputSchema = createTourSchemaBase.superRefine(
	(data, ctx) => {
		const hasDepartures = (data.departures ?? []).length > 0
		const hasPrice =
			typeof data.price === "number" && !Number.isNaN(data.price) && data.price > 0

		if (!hasDepartures && !hasPrice) {
			ctx.addIssue({
				code: "custom",
				message: "Укажите базовую цену тура или добавьте хотя бы один выезд",
				path: ["price"],
			})
		}
	},
)

export const tourUpdateInputSchema = z
	.object({
		title: z.string().min(1, "Название тура обязательно").max(200).optional(),
		shortDescription: z
			.string()
			.min(1, "Краткое описание обязательно")
			.max(500, "Краткое описание слишком длинное")
			.optional(),
		fullDescriptionBlocks: fullDescriptionBlocksSchema.optional(),
		programText: z
			.string()
			.max(20000, "Программа тура слишком длинная")
			.optional()
			.or(z.literal("")),
		price: positiveNumberInput(
			"Цена должна быть положительным числом",
			"Цена должна быть больше 0",
		)
			.optional()
			.or(z.literal("")),
		agentPrice: positiveNumberInput(
			"Агентская цена должна быть положительным числом",
			"Агентская цена должна быть больше 0",
		)
			.optional()
			.or(z.literal("")),
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
		departures: z.array(tourDepartureInputSchema).optional(),
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
	.superRefine((data, ctx) => {
		if (data.departures && data.departures.length > 0) {
			const hasAvailableDeparture = data.departures.some(
				departure => departure.available,
			)

			if (!hasAvailableDeparture) {
				ctx.addIssue({
					code: "custom",
					message: "Добавьте хотя бы один доступный выезд",
					path: ["departures"],
				})
			}
		}
	})

export type TourCreateInput = z.infer<typeof tourCreateInputSchema>
export type TourUpdateInput = z.infer<typeof tourUpdateInputSchema>
