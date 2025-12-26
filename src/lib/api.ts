import {
	bookingStatusUpdateSchema,
	tourCreateInputSchema,
	tourUpdateInputSchema,
	type BookingStatusUpdateInput,
	type TourCreateInput,
	type TourUpdateInput,
} from "@/lib/validation"
import type {
	ApiCollection,
	Booking,
	CreateBookingInput,
	CreateManagerInput,
	Message,
	Tour,
	UpdateBookingInput,
	UpdateManagerInput,
	User,
} from "@/types"
import { MessageType } from "@/types/enums"
import type {
	CreateGroupTransportBookingInput,
	GroupTransportBooking,
	GroupTransportSegment,
	GroupTransportSegmentInput,
} from "@/types/group-transport"
import { z } from "zod"
import {
	ApiCollectionSchema,
	BookingSchema,
	MessageSchema,
	TourSchema,
	UserSchema,
} from "./api-schemas"
import { env } from "./env"
import { ApiError, NetworkError, ValidationError } from "./errors"
import { normalizeImageUrl } from "./url"

const apiBaseUrl =
	typeof window === "undefined"
		? env.NEXT_PUBLIC_API_URL ||
		  env.APP_URL ||
		  env.NEXTAUTH_URL ||
		  "http://localhost:3000"
		: process.env.NEXT_PUBLIC_API_URL || ""

const REQUEST_TIMEOUT = 30000 // 30 секунд

async function parseErrorResponse(
	response: Response
): Promise<{ message: string; code?: string; details?: unknown }> {
	try {
		const contentType = response.headers.get("content-type")

		if (contentType?.includes("application/json")) {
			const data = await response.json()

			return {
				message: data.message || data.error?.message || "Ошибка запроса",
				code: data.code || data.error?.code,
				details: data.details || data.error?.details,
			}
		}

		const text = await response.text()

		return { message: text || "Ошибка запроса" }
	} catch {
		return { message: "Ошибка запроса" }
	}
}

async function fetchJson<T>(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<T> {
	const url =
		typeof input === "string" && input.startsWith("/")
			? (apiBaseUrl + input).replace(/([^:]\/)\/+/g, "$1")
			: input

	const authHeaders =
		typeof window === "undefined"
			? {}
			: await (async () => {
					const { getSession } = await import("next-auth/react")
					const session = await getSession()
					const accessToken = (session as { accessToken?: string })?.accessToken
					return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
			  })()

	const headers = new Headers(init?.headers)
	Object.entries(authHeaders).forEach(([key, value]) => {
		headers.set(key, value)
	})

	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

	try {
		const res = await fetch(url, {
			cache: "no-store",
			...init,
			headers,
			signal: controller.signal,
		})

		clearTimeout(timeoutId)

		if (!res.ok) {
			const errorData = await parseErrorResponse(res)

			if (res.status === 422) {
				throw new ValidationError(
					errorData.message,
					errorData.details as Record<string, string[]> | undefined
				)
			}

			throw new ApiError(
				errorData.message,
				res.status,
				errorData.code,
				errorData.details
			)
		}

		return res.json() as Promise<T>
	} catch (error) {
		clearTimeout(timeoutId)

		if (error instanceof ApiError || error instanceof ValidationError) {
			throw error
		}

		if (error instanceof Error && error.name === "AbortError") {
			throw new NetworkError(
				`Запрос превысил время ожидания (${REQUEST_TIMEOUT / 1000} секунд)`
			)
		}

		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new NetworkError("Не удалось подключиться к серверу")
		}

		if (error instanceof Error) {
			throw new NetworkError(error.message)
		}

		throw new NetworkError("Произошла неизвестная ошибка")
	}
}

async function fetchAndValidate<
	TType,
	TSchema extends z.ZodType<TType> = z.ZodType<TType>
>(
	input: RequestInfo | URL,
	schema: TSchema,
	init?: RequestInit
): Promise<TType> {
	const rawData = await fetchJson<unknown>(input, init)

	try {
		return schema.parse(rawData) as TType
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorDetails = error.issues.reduce(
				(acc: Record<string, string[]>, err: z.core.$ZodIssue) => {
					const path = err.path.join(".") || "root"
					acc[path] = acc[path] || []
					acc[path].push(err.message)
					return acc
				},
				{} as Record<string, string[]>
			)

			console.error("[API Validation Error]", {
				url: input,
				errors: error.issues.map(issue => ({
					path: issue.path.join(".") || "root",
					message: issue.message,
					code: issue.code,
				})),
				errorDetails,
				receivedData: rawData,
			})

			throw new ValidationError(
				"Данные от сервера не соответствуют ожидаемой структуре",
				errorDetails
			)
		}

		throw error
	}
}

type RawGroupTransportSegment = Record<string, unknown>

type AuthResponse = {
	user: {
		id: string
		email: string
		name?: string
		role?: string
	}
	tokens?: {
		accessToken: string
		refreshToken: string
		accessExpiresIn?: string | number
		refreshExpiresIn?: string | number
	}
}

const normalizeGroupTransportSegment = (
	segment: RawGroupTransportSegment
): GroupTransportSegment => {
	const directionValue = String(segment.direction)
	const direction: GroupTransportSegment["direction"] =
		directionValue === "return" ? "return" : "forward"
	const passengers =
		typeof segment.passengers === "object" && segment.passengers
			? (segment.passengers as Record<string, number>)
			: {
					seniorsEco: Number(segment.seniorsEco || 0),
					adultsEco: Number(segment.adultsEco || 0),
					youthEco: Number(segment.youthEco || 0),
					childrenEco: Number(segment.childrenEco || 0),
					infantsEco: Number(segment.infantsEco || 0),
					seniorsBusiness: Number(segment.seniorsBusiness || 0),
					adultsBusiness: Number(segment.adultsBusiness || 0),
					youthBusiness: Number(segment.youthBusiness || 0),
					childrenBusiness: Number(segment.childrenBusiness || 0),
					infantsBusiness: Number(segment.infantsBusiness || 0),
			  }

	return {
		direction,
		departureDate: String(segment.departureDate),
		flightNumber: String(segment.flightNumber || ""),
		from: String(segment.from || ""),
		to: String(segment.to || ""),
		passengers: {
			seniorsEco: passengers.seniorsEco || 0,
			adultsEco: passengers.adultsEco || 0,
			youthEco: passengers.youthEco || 0,
			childrenEco: passengers.childrenEco || 0,
			infantsEco: passengers.infantsEco || 0,
			seniorsBusiness: passengers.seniorsBusiness || 0,
			adultsBusiness: passengers.adultsBusiness || 0,
			youthBusiness: passengers.youthBusiness || 0,
			childrenBusiness: passengers.childrenBusiness || 0,
			infantsBusiness: passengers.infantsBusiness || 0,
		},
	}
}

const normalizeGroupTransportBooking = (
	booking: Record<string, unknown>
): GroupTransportBooking => {
	const segments = Array.isArray(booking.segments) ? booking.segments : []

	return {
		id: String(booking.id),
		userId: String(booking.userId),
		status: booking.status as GroupTransportBooking["status"],
		createdAt: String(booking.createdAt),
		note: booking.note ? String(booking.note) : undefined,
		segments: segments.map(segment =>
			normalizeGroupTransportSegment(segment as RawGroupTransportSegment)
		),
	}
}

const parseMessagesResponse = async (
	url: string
): Promise<ApiCollection<Message>> => {
	const raw = await fetchJson<unknown>(url)

	let items: unknown[] = []
	let total: number | undefined
	let pagination: ApiCollection<Message>["pagination"]

	if (Array.isArray(raw)) {
		items = raw
	} else if (raw && typeof raw === "object") {
		const data = raw as Record<string, unknown>
		const nested =
			(data.data && typeof data.data === "object"
				? (data.data as Record<string, unknown>)
				: null) || null

		if (Array.isArray(data.items)) {
			items = data.items
		} else if (Array.isArray(data.messages)) {
			items = data.messages
		} else if (Array.isArray(data.result)) {
			items = data.result
		} else if (nested) {
			if (Array.isArray(nested.items)) {
				items = nested.items
			} else if (Array.isArray(nested.messages)) {
				items = nested.messages
			}
		}

		if (typeof data.total === "number") {
			total = data.total
		} else if (nested && typeof nested.total === "number") {
			total = nested.total
		}

		if (data.pagination && typeof data.pagination === "object") {
			pagination = data.pagination as ApiCollection<Message>["pagination"]
		} else if (nested && typeof nested.pagination === "object") {
			pagination = nested.pagination as ApiCollection<Message>["pagination"]
		}
	}

	const parsedItems: Message[] = []
	const errorDetails: Record<string, string[]> = {}

	items.forEach((item, index) => {
		const parsed = MessageSchema.safeParse(item)
		if (parsed.success) {
			parsedItems.push(parsed.data)
			return
		}

		errorDetails[`items.${index}`] = parsed.error.issues.map(
			issue => issue.message
		)
	})

	if (Object.keys(errorDetails).length > 0) {
		console.error("[API Validation Error]", {
			url,
			errorDetails,
			receivedData: raw,
		})

		if (parsedItems.length === 0 && items.length > 0) {
			throw new ValidationError(
				"Данные от сервера не соответствуют ожидаемой структуре",
				errorDetails
			)
		}
	}

	return {
		items: parsedItems,
		total,
		pagination,
	}
}

const toIsoDate = (value: string) => {
	const trimmed = value.trim()
	if (!trimmed) return ""
	if (trimmed.includes("T")) return trimmed
	const parsed = new Date(trimmed)
	return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString()
}

const serializeGroupTransportSegment = (
	segment: GroupTransportSegmentInput
): Record<string, unknown> => {
	const passengers = segment.passengers || {
		seniorsEco: 0,
		adultsEco: 0,
		youthEco: 0,
		childrenEco: 0,
		infantsEco: 0,
		seniorsBusiness: 0,
		adultsBusiness: 0,
		youthBusiness: 0,
		childrenBusiness: 0,
		infantsBusiness: 0,
	}

	return {
		direction: segment.direction,
		departureDate: toIsoDate(segment.departureDate),
		flightNumber: segment.flightNumber || "",
		from: segment.from || "",
		to: segment.to || "",
		seniorsEco: Number(passengers.seniorsEco || 0),
		adultsEco: Number(passengers.adultsEco || 0),
		youthEco: Number(passengers.youthEco || 0),
		childrenEco: Number(passengers.childrenEco || 0),
		infantsEco: Number(passengers.infantsEco || 0),
		seniorsBusiness: Number(passengers.seniorsBusiness || 0),
		adultsBusiness: Number(passengers.adultsBusiness || 0),
		youthBusiness: Number(passengers.youthBusiness || 0),
		childrenBusiness: Number(passengers.childrenBusiness || 0),
		infantsBusiness: Number(passengers.infantsBusiness || 0),
	}
}

export const api = {
	subscribeMailing: async (input: {
		email: string
	}): Promise<{ ok: boolean }> => {
		return fetchJson<{ ok: boolean }>("/api/mailing/subscribe", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		})
	},
	createContactRequest: async (input: {
		name: string
		email: string
		phone?: string
		message: string
	}): Promise<{ ok: boolean }> => {
		return fetchJson<{ ok: boolean }>("/api/contacts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		})
	},
	registerUser: async (input: {
		name: string
		email: string
		password: string
		phone?: string
	}): Promise<AuthResponse> => {
		return fetchJson<AuthResponse>("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		})
	},
	getTours: () =>
		fetchAndValidate<ApiCollection<Tour>>(
			"/api/tours",
			ApiCollectionSchema(TourSchema)
		),
	getTour: (id: string) =>
		fetchAndValidate<Tour>(`/api/tours/${id}`, TourSchema),
	getManagers: async (): Promise<ApiCollection<User>> => {
		return fetchAndValidate<ApiCollection<User>>(
			"/api/admin/managers",
			ApiCollectionSchema(UserSchema)
		)
	},
	uploadTourImage: async (file: File): Promise<{ url: string }> => {
		const formData = new FormData()
		formData.append("file", file)

		return fetchJson<{ url: string }>("/api/uploads/tours", {
			method: "POST",
			body: formData,
		})
	},
	createManager: async (input: CreateManagerInput): Promise<User> => {
		return fetchJson<User>("/api/admin/managers", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		})
	},
	updateManager: async (
		id: string,
		data: UpdateManagerInput
	): Promise<User> => {
		return fetchJson<User>(`/api/admin/managers/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
	},
	deleteManager: async (id: string): Promise<{ success: boolean }> => {
		return fetchJson<{ success: boolean }>(`/api/admin/managers/${id}`, {
			method: "DELETE",
		})
	},
	getBookings: () =>
		fetchAndValidate<ApiCollection<Booking>>(
			"/api/bookings",
			ApiCollectionSchema(BookingSchema)
		),
	getGroupTransportBookings: async (): Promise<
		ApiCollection<GroupTransportBooking>
	> => {
		const response = await fetchJson<ApiCollection<Record<string, unknown>>>(
			"/api/group-transport/bookings"
		)

		return {
			...response,
			items: response.items.map(normalizeGroupTransportBooking),
		}
	},
	getGroupTransportBooking: async (
		id: string
	): Promise<GroupTransportBooking> => {
		const raw = await fetchJson<Record<string, unknown>>(
			`/api/group-transport/bookings/${id}`
		)

		return normalizeGroupTransportBooking(raw)
	},
	createGroupTransportBooking: async (
		data: CreateGroupTransportBookingInput
	): Promise<GroupTransportBooking> => {
		const payload = {
			...data,
			note: data.note?.trim() || undefined,
			segments: data.segments.map(serializeGroupTransportSegment),
		}

		const raw = await fetchJson<Record<string, unknown>>(
			"/api/group-transport/bookings",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}
		)

		return normalizeGroupTransportBooking(raw)
	},
	updateGroupTransportBookingStatus: async (
		id: string,
		status: GroupTransportBooking["status"]
	): Promise<GroupTransportBooking> => {
		const raw = await fetchJson<Record<string, unknown>>(
			`/api/group-transport/bookings/${id}/status`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			}
		)

		return normalizeGroupTransportBooking(raw)
	},
	getBooking: (id: string): Promise<Booking> =>
		fetchAndValidate<Booking>(`/api/bookings/${id}`, BookingSchema),
	getMessages: async (bookingId: string): Promise<ApiCollection<Message>> => {
		return parseMessagesResponse(`/api/bookings/${bookingId}/messages`)
	},
	getGroupTransportMessages: async (
		bookingId: string
	): Promise<ApiCollection<Message>> => {
		return parseMessagesResponse(
			`/api/group-transport/bookings/${bookingId}/messages`
		)
	},

	createTour: async (data: TourCreateInput): Promise<Tour> => {
		const validatedData = tourCreateInputSchema.parse(data)
		const payload = {
			...validatedData,
			image: normalizeImageUrl(validatedData.image),
		}

		return fetchJson<Tour>("/api/tours", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
	},

	updateTour: async (id: string, data: TourUpdateInput): Promise<Tour> => {
		const payload = { ...data }

		if (typeof payload.image === "string") {
			const trimmed = payload.image.trim()
			if (!trimmed) {
				delete payload.image
			} else {
				payload.image = normalizeImageUrl(trimmed)
			}
		}

		const validatedData = tourUpdateInputSchema.parse(payload)

		return fetchJson<Tour>(`/api/tours/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(validatedData),
		})
	},

	deleteTour: async (id: string): Promise<{ success: boolean }> => {
		return fetchJson<{ success: boolean }>(`/api/tours/${id}`, {
			method: "DELETE",
		})
	},

	updateBookingStatus: async (
		id: string,
		status: BookingStatusUpdateInput["status"]
	): Promise<Booking> => {
		const validatedData = bookingStatusUpdateSchema.parse({ id, status })

		return fetchJson<Booking>(`/api/bookings/${id}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: validatedData.status }),
		})
	},

	cancelBooking: async (id: string): Promise<Booking> => {
		return fetchJson<Booking>(`/api/bookings/${id}/cancel`, {
			method: "POST",
		})
	},

	createMessage: async (
		bookingId: string,
		text: string,
		type: MessageType = MessageType.TEXT,
		attachments?: Array<string | Record<string, unknown>>
	): Promise<Message> => {
		return fetchJson<Message>(`/api/bookings/${bookingId}/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				text,
				type,
				attachments,
			}),
		})
	},
	createGroupTransportMessage: async (
		bookingId: string,
		text: string,
		type: MessageType = MessageType.TEXT,
		attachments?: Array<string | Record<string, unknown>>
	): Promise<Message> => {
		return fetchJson<Message>(
			`/api/group-transport/bookings/${bookingId}/messages`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text,
					type,
					attachments,
				}),
			}
		)
	},

	deleteMessage: async (
		bookingId: string,
		messageId: string
	): Promise<{ success: boolean }> => {
		return fetchJson<{ success: boolean }>(
			`/api/bookings/${bookingId}/messages/${messageId}`,
			{ method: "DELETE" }
		)
	},
	deleteGroupTransportMessage: async (
		bookingId: string,
		messageId: string
	): Promise<{ success: boolean }> => {
		return fetchJson<{ success: boolean }>(
			`/api/group-transport/bookings/${bookingId}/messages/${messageId}`,
			{ method: "DELETE" }
		)
	},
	createBooking: async (data: CreateBookingInput) => {
		return fetchJson<Booking>("/api/bookings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
	},
	updateBooking: async (id: string, data: UpdateBookingInput) => {
		return fetchJson<Booking>(`/api/bookings/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
	},
	deleteBooking: async (id: string) => {
		return fetchJson<{ success: boolean }>(`/api/bookings/${id}`, {
			method: "DELETE",
		})
	},
	markMessageRead: async (bookingId: string, messageId: string) => {
		return fetchJson(`/api/bookings/${bookingId}/messages/${messageId}/read`, {
			method: "PATCH",
		})
	},
	markGroupTransportMessageRead: async (
		bookingId: string,
		messageId: string
	) => {
		return fetchJson(
			`/api/group-transport/bookings/${bookingId}/messages/${messageId}/read`,
			{
				method: "PATCH",
			}
		)
	},
	markAllMessagesRead: async (bookingId: string) => {
		return fetchJson(`/api/bookings/${bookingId}/messages/read-all`, {
			method: "PATCH",
		})
	},
	markAllGroupTransportMessagesRead: async (bookingId: string) => {
		return fetchJson(
			`/api/group-transport/bookings/${bookingId}/messages/read-all`,
			{
				method: "PATCH",
			}
		)
	},
}
