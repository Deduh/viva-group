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

const ParticipantSchema = z.object({
	fullName: z.string(),
	birthDate: z.string(),
	gender: z.enum(["male", "female"]),
	passportNumber: z.string(),
})

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

const fullDescriptionBlockSchema = z.object({
	title: z.string().min(1, "Заголовок блока обязателен"),
	items: z.array(z.string()).default([]),
})

export const TourSchema = z.object({
	id: z.string().min(1, "ID тура обязателен"),
	publicId: z.string().min(1, "Публичный ID тура обязателен").optional(),
	title: z.string().min(1, "Название тура обязательно"),
	shortDescription: z.string().min(1, "Краткое описание обязательно"),
	fullDescriptionBlocks: z.array(fullDescriptionBlockSchema).default([]),
	price: z.coerce.number().positive("Цена должна быть положительным числом"),
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
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
})

export const CharterBookingSchema = z.object({
	id: z.string().min(1, "ID бронирования обязателен"),
	publicId: z.string().min(1, "Публичный ID бронирования обязателен"),
	userId: z.string().min(1, "ID пользователя обязателен"),
	flightId: z.string().min(1, "ID рейса обязателен"),
	dateFrom: z.string().min(1),
	dateTo: z.string().min(1),
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

const nullToUndefined = <T>(val: T | null | undefined): T | undefined => {
	return val ?? undefined
}

export const BookingSchema = z.object({
	id: z.string().min(1, "ID бронирования обязателен"),
	publicId: z.string().min(1).optional(),
	userId: z.string().min(1, "ID пользователя обязателен"),
	tourId: z.string().min(1, "ID тура обязателен"),
	tourPublicId: z.string().min(1).optional(),
	status: BookingStatusSchema,
	participants: z.array(ParticipantSchema),
	notes: z.string().nullable().optional().transform(nullToUndefined),
	createdAt: z.iso.datetime("Некорректная дата создания"),
	updatedAt: z.iso.datetime().nullable().optional().transform(nullToUndefined),
	paymentStatus: PaymentStatusInputSchema.optional(),
	totalAmount: optionalPositiveNumberSchema.optional(),
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
