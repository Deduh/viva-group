import { ROLES } from "@/lib/roles"
import { BookingStatus, MessageType, PaymentStatus } from "@/types/enums"
import { z } from "zod"

const BookingStatusSchema = z.enum([
	BookingStatus.PENDING,
	BookingStatus.CONFIRMED,
	BookingStatus.CANCELLED,
	BookingStatus.IN_PROGRESS,
	BookingStatus.COMPLETED,
])

const MessageTypeSchema = z.enum([
	MessageType.TEXT,
	MessageType.IMAGE,
	MessageType.FILE,
	MessageType.SYSTEM,
	MessageType.NOTIFICATION,
])

const MessageTypeInputSchema = z.preprocess(value => {
	if (typeof value !== "string") return undefined

	const normalized = value.toUpperCase()

	return Object.values(MessageType).includes(normalized as MessageType)
		? normalized
		: undefined
}, MessageTypeSchema.optional())

const PaymentStatusSchema = z.enum([
	PaymentStatus.PENDING,
	PaymentStatus.PAID,
	PaymentStatus.FAILED,
	PaymentStatus.REFUNDED,
])

const RoleSchema = z.enum(ROLES)

const stringArraySchema = z.preprocess(value => {
	if (Array.isArray(value)) return value

	if (typeof value === "string") {
		return value
			.split(",")
			.map(item => item.trim())
			.filter(Boolean)
	}

	return []
}, z.array(z.string()))

const optionalPositiveNumberSchema = z.preprocess(value => {
	if (value === "" || value === null || value === undefined) return undefined

	if (typeof value === "number") {
		return Number.isNaN(value) ? undefined : value
	}

	if (typeof value === "string") {
		const trimmed = value.trim()

		if (!trimmed) return undefined

		const numeric = Number(trimmed)

		return Number.isNaN(numeric) ? undefined : numeric
	}

	return value
}, z.number().positive().optional())

const optionalNonNegativeNumberSchema = z.preprocess(value => {
	if (value === "" || value === null || value === undefined) return undefined

	if (typeof value === "number") {
		return Number.isNaN(value) ? undefined : value
	}

	if (typeof value === "string") {
		const trimmed = value.trim()

		if (!trimmed) return undefined

		const numeric = Number(trimmed)

		return Number.isNaN(numeric) ? undefined : numeric
	}

	return value
}, z.number().min(0).optional())

const booleanLikeSchema = z.preprocess(value => {
	if (value === null || value === undefined) return value

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase()

		if (normalized === "true") return true
		if (normalized === "false") return false
		if (normalized === "1") return true
		if (normalized === "0") return false
	}

	return value
}, z.boolean())

const PaymentStatusInputSchema = z.preprocess(value => {
	if (value === null || value === undefined || value === "") return undefined

	if (typeof value !== "string") return value

	const normalized = value.trim().toUpperCase()

	return Object.values(PaymentStatus).includes(normalized as PaymentStatus)
		? normalized
		: undefined
}, PaymentStatusSchema.optional())

const CurrencyCodeSchema = z.enum(["RUB", "USD", "EUR", "CNY"])

const ParticipantBaseSchema = z.object({
	fullName: z.string(),
	fullNameLatin: z.string().optional(),
	birthDate: z.string(),
	gender: z.enum(["male", "female"]),
	passportNumber: z.string(),
	passportExpiresAt: z.string().optional(),
	selectedHotelId: z.string().optional(),
	selectedHotelName: z.string().optional(),
})

const ParticipantSchema = ParticipantBaseSchema.transform(raw => ({
	...raw,
	fullNameLatin: raw.fullNameLatin ?? raw.fullName,
	passportExpiresAt: raw.passportExpiresAt ?? "9999-12-31",
}))

const ParticipantPricingSnapshotSchema = ParticipantBaseSchema.extend({
	baseTourPrice: z.coerce.number().nonnegative(),
	hotelSupplement: z.coerce.number().nonnegative(),
	total: z.coerce.number().nonnegative(),
}).transform(raw => ({
		...raw,
		fullNameLatin: raw.fullNameLatin ?? raw.fullName,
		passportExpiresAt: raw.passportExpiresAt ?? "9999-12-31",
	baseTourPrice: raw.baseTourPrice,
	hotelSupplement: raw.hotelSupplement,
	total: raw.total,
}))

const attachmentsSchema = z.preprocess(
	value => {
		if (value === null || value === undefined) return []

		if (Array.isArray(value)) return value

		return [value]
	},
	z.array(z.union([z.string(), z.record(z.string(), z.any())])),
)

const nullableDateSchema = z.preprocess(value => {
	if (value === null || value === undefined) return undefined
	if (value instanceof Date) return value.toISOString()
	if (typeof value === "number") return new Date(value).toISOString()

	return value
}, z.string().optional())

const nullableStringSchema = z.preprocess(value => {
	if (value === null || value === undefined) return undefined

	return value
}, z.string().optional())

const nullToUndefined = <T>(val: T | null | undefined): T | undefined => {
	return val ?? undefined
}

const fullDescriptionBlockSchema = z.object({
	title: z.string().min(1, "Заголовок блока обязателен"),
	items: z.array(z.string()).default([]),
})

const TourHotelSchema = z
	.object({
		id: z.string().min(1, "ID отеля обязателен"),
		name: z.string().min(1, "Название отеля обязательно"),
		stars: z.coerce.number().int().min(1).max(5),
		note: nullableStringSchema.optional(),
		supplementPrice: optionalPositiveNumberSchema.optional(),
		basePrice: optionalPositiveNumberSchema.optional(),
		agentSupplementPrice: optionalPositiveNumberSchema.optional(),
		agentPrice: optionalPositiveNumberSchema.optional(),
		baseCurrency: CurrencyCodeSchema.default("RUB"),
	})
	.transform(raw => ({
		id: raw.id,
		name: raw.name,
		stars: raw.stars,
		note: raw.note,
		supplementPrice: raw.supplementPrice ?? raw.basePrice ?? 0,
		agentSupplementPrice: raw.agentSupplementPrice ?? raw.agentPrice,
		baseCurrency: raw.baseCurrency,
	}))

export const TourSchema = z.object({
	id: z.string().min(1, "ID тура обязателен"),
	publicId: z.string().min(1, "Публичный ID тура обязателен").optional(),
	title: z.string().min(1, "Название тура обязательно"),
	shortDescription: z.string().min(1, "Краткое описание обязательно"),
	fullDescriptionBlocks: z.array(fullDescriptionBlockSchema).default([]),
	price: z.coerce.number().positive("Цена должна быть положительным числом"),
	agentPrice: optionalPositiveNumberSchema.optional(),
	baseCurrency: CurrencyCodeSchema.default("RUB"),
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
	tags: stringArraySchema.default([]),
	categories: stringArraySchema.default([]),
	programText: nullableStringSchema.optional(),
	hasHotelOptions: booleanLikeSchema.default(false),
	hotels: z.array(TourHotelSchema).default([]),
	dateFrom: nullableDateSchema.optional(),
	dateTo: nullableDateSchema.optional(),
	durationDays: optionalPositiveNumberSchema.optional(),
	durationNights: optionalPositiveNumberSchema.optional(),
	available: z.coerce.boolean().optional(),
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
})

const CharterBookingUserSchema = z.object({
	id: z.string().min(1),
	email: z.string().min(1),
	name: z.string().nullable().optional(),
})

const CharterTripTypeSchema = z.enum(["ONE_WAY", "ROUND_TRIP"])

export const CharterFlightSchema = z.object({
	id: z.string().min(1, "ID рейса обязателен"),
	publicId: z.string().min(1, "Публичный ID рейса обязателен"),
	from: z.string().min(1),
	to: z.string().min(1),
	dateFrom: z.string().min(1),
	dateTo: z.string().min(1),
	weekDays: z.array(z.coerce.number().int().min(1).max(7)).default([]),
	categories: stringArraySchema.default([]),
	seatsTotal: z.coerce.number().int().min(1),
	hasBusinessClass: z.coerce.boolean(),
	hasComfortClass: z.coerce.boolean(),
	isActive: booleanLikeSchema.default(true),
	price: optionalPositiveNumberSchema.optional(),
	priceCurrency: z
		.preprocess(value => (value === null ? undefined : value), CurrencyCodeSchema)
		.optional(),
	agentPrice: optionalPositiveNumberSchema.optional(),
	agentCommission: optionalNonNegativeNumberSchema.optional(),
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
})

const AgentApplicationStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])

export const AgentApplicationSchema = z.object({
	id: z.string().min(1, "ID заявки обязателен"),
	userId: z.string().optional(),
	email: z.email("Некорректный email адрес"),
	name: z.string().nullable().optional().transform(nullToUndefined),
	companyName: z.string().min(1, "Название компании обязательно"),
	contactName: z.string().min(1, "Имя контактного лица обязательно"),
	phone: z.string().min(1, "Телефон обязателен"),
	website: z.string().nullable().optional().transform(nullToUndefined),
	city: z.string().nullable().optional().transform(nullToUndefined),
	comment: z.string().nullable().optional().transform(nullToUndefined),
	status: AgentApplicationStatusSchema.default("PENDING"),
	createdAt: z.iso.datetime("Некорректная дата создания"),
	updatedAt: z.iso.datetime().nullable().optional().transform(nullToUndefined),
	reviewedAt: z.iso.datetime().nullable().optional().transform(nullToUndefined),
	reviewerName: z.string().nullable().optional().transform(nullToUndefined),
	rejectionReason: z
		.string()
		.nullable()
		.optional()
		.transform(nullToUndefined),
})

export const AgentApplicationCurrentSchema = z.object({
	item: AgentApplicationSchema.nullable(),
})

const CurrencyRateSchema = z.object({
	currency: CurrencyCodeSchema,
	rate: z.coerce.number().positive("Курс должен быть положительным"),
	markupPercent: z.coerce.number().min(0),
})

export const CurrencySettingsSchema = z.object({
	baseCurrency: CurrencyCodeSchema.default("RUB"),
	rates: z.array(CurrencyRateSchema).default([]),
	updatedAt: z.string().default(() => new Date().toISOString()),
})

export const CharterBookingSchema = z.object({
	id: z.string().min(1, "ID бронирования обязателен"),
	publicId: z.string().min(1, "Публичный ID бронирования обязателен"),
	userId: z.string().min(1, "ID пользователя обязателен"),
	flightId: z.string().min(1, "ID рейса обязателен"),
	tripType: CharterTripTypeSchema.default("ROUND_TRIP"),
	dateFrom: z.string().min(1),
	dateTo: z.string().min(1).nullable(),
	adults: z.coerce.number().int().min(1),
	children: z.coerce.number().int().min(0).default(0),
	status: BookingStatusSchema,
	// Legacy-compatible fields for transitional UI
	from: z.string().optional(),
	to: z.string().optional(),
	categories: stringArraySchema.optional(),
	createdAt: z.iso.datetime("Некорректная дата создания"),
	updatedAt: z.iso.datetime(),
	user: CharterBookingUserSchema.optional(),
	flight: CharterFlightSchema.optional(),
})

export const BookingSchema = z.object({
	id: z.string().min(1, "ID бронирования обязателен"),
	publicId: z.string().min(1).optional(),
	orderId: z.string().min(1).optional(),
	userId: z.string().min(1, "ID пользователя обязателен"),
	tourId: z.string().min(1, "ID тура обязателен"),
	tourPublicId: z.string().min(1).optional(),
	status: BookingStatusSchema,
	participants: z.array(ParticipantSchema),
	notes: z.string().nullable().optional().transform(nullToUndefined),
	createdAt: z.iso.datetime("Некорректная дата создания"),
	updatedAt: z.iso.datetime().nullable().optional().transform(nullToUndefined),
	paymentStatus: PaymentStatusInputSchema.optional(),
	totalAmount: optionalNonNegativeNumberSchema.optional(),
	pricingSnapshot: z
		.object({
			roleSnapshot: RoleSchema,
			tour: z.object({
				id: z.string().min(1),
				publicId: z.string().nullable().optional(),
				title: z.string().min(1),
				basePrice: z.coerce.number().nonnegative(),
				baseCurrency: CurrencyCodeSchema,
			}),
			participants: z.array(ParticipantPricingSnapshotSchema),
			totalAmount: z.coerce.number().nonnegative(),
		})
		.optional(),
	tour: TourSchema.optional(),
	user: z.lazy(() => UserSchema).optional(),
})

export const BookingOrderSchema = z.object({
	id: z.string().min(1),
	publicId: z.string().min(1),
	userId: z.string().min(1),
	roleSnapshot: RoleSchema,
	currency: CurrencyCodeSchema,
	totalAmount: z.coerce.number().nonnegative(),
	itemsCount: z.coerce.number().int().nonnegative(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
	bookings: z.array(BookingSchema).default([]),
	user: z.lazy(() => UserSchema).optional(),
})

export const TourCartLeadSchema = z.object({
	id: z.string().min(1),
	publicId: z.string().min(1),
	name: z.string().min(1),
	email: z.email(),
	phone: z.string().nullable().optional().transform(nullToUndefined),
	status: z.enum(["new", "handled"]),
	cartSnapshot: z.object({
		items: z
			.array(
				z.object({
					tourId: z.string().min(1),
					tourPublicId: z.string().nullable().optional(),
					title: z.string().min(1),
					shortDescription: z.string().min(1),
					price: z.coerce.number().nonnegative(),
					agentPrice: optionalPositiveNumberSchema.nullable().optional(),
					baseCurrency: CurrencyCodeSchema,
					hasHotelOptions: z.coerce.boolean(),
					participantsCount: z.coerce.number().int().positive(),
					note: z.string().nullable().optional().transform(nullToUndefined),
				}),
			)
			.default([]),
		submittedAt: z.string(),
	}),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
})

const RawMessageSchema = z.object({
	id: z.union([z.string(), z.number()]),
	bookingId: z.union([z.string(), z.number(), z.null()]).optional(),
	groupTransportBookingId: z
		.union([z.string(), z.number(), z.null()])
		.optional(),
	charterBookingId: z.union([z.string(), z.number(), z.null()]).optional(),
	booking: z
		.object({
			id: z.union([z.string(), z.number()]),
		})
		.optional(),
	groupTransportBooking: z
		.object({
			id: z.union([z.string(), z.number()]),
		})
		.optional(),
	charterBooking: z
		.object({
			id: z.union([z.string(), z.number()]),
		})
		.optional(),
	authorId: z.union([z.string(), z.number(), z.null()]).optional(),
	userId: z.union([z.string(), z.number(), z.null()]).optional(),
	author: z
		.object({
			id: z.union([z.string(), z.number()]).optional(),
			name: z.string().nullable().optional(),
			email: z.string().nullable().optional(),
			role: RoleSchema.optional(),
		})
		.optional(),
	authorName: z.string().nullable().optional(),
	text: z.string().nullable().optional(),
	message: z.string().nullable().optional(),
	content: z.string().nullable().optional(),
	type: MessageTypeInputSchema,
	createdAt: nullableDateSchema.optional(),
	created: nullableDateSchema.optional(),
	isRead: z.boolean().optional(),
	readByMe: z.boolean().optional(),
	read: z.boolean().optional(),
	attachments: attachmentsSchema.optional(),
})

export const MessageSchema = RawMessageSchema.transform(raw => {
	const bookingId =
		raw.bookingId ??
		raw.groupTransportBookingId ??
		raw.charterBookingId ??
		raw.booking?.id ??
		raw.groupTransportBooking?.id ??
		raw.charterBooking?.id ??
		""
	const authorId = raw.authorId ?? raw.userId ?? raw.author?.id ?? ""
	const text = raw.text ?? raw.message ?? raw.content ?? ""
	const createdAt = raw.createdAt ?? raw.created ?? new Date().toISOString()
	const createdAtValue =
		typeof createdAt === "number" ? new Date(createdAt) : createdAt

	return {
		id: String(raw.id),
		bookingId: String(bookingId),
		authorId: String(authorId),
		authorName: raw.authorName ?? raw.author?.name ?? raw.author?.email,
		text,
		type: raw.type,
		createdAt:
			typeof createdAtValue === "string"
				? createdAtValue
				: createdAtValue.toISOString(),
		isRead: raw.isRead ?? raw.read,
		readByMe: raw.readByMe,
		attachments: raw.attachments,
	}
})

export const UserSchema = z.object({
	id: z.string().min(1, "ID пользователя обязателен"),
	email: z.email("Некорректный email адрес"),
	name: z.string().nullable().optional(),
	role: RoleSchema,
	avatar: z.url().nullable().optional(),
	phone: z.string().nullable().optional(),
	createdAt: z.iso.datetime().optional(),
	status: z.enum(["active", "blocked"]).optional(),
	lastLoginAt: z.iso.datetime().nullable().optional(),
	invitedAt: z.iso.datetime().nullable().optional(),
	invitedBy: z.string().nullable().optional(),
	password: z.string().nullable().optional(),
})

export const PaginationMetaSchema = z.object({
	page: z
		.number()
		.int()
		.positive("Номер страницы должен быть положительным числом")
		.optional(),
	limit: z
		.number()
		.int()
		.positive("Лимит должен быть положительным числом")
		.optional(),
	total: z
		.number()
		.int()
		.nonnegative("Общее количество не может быть отрицательным")
		.optional(),
	totalPages: z
		.number()
		.int()
		.nonnegative("Общее количество страниц не может быть отрицательным")
		.optional(),
	hasNext: z.boolean().optional(),
	hasPrev: z.boolean().optional(),
})

export function ApiCollectionSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		items: z.array(itemSchema),
		total: z.number().int().nonnegative().optional(),
		pagination: PaginationMetaSchema.optional(),
	})
}
