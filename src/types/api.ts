import type { Role } from "@/lib/roles"
import type { BookingStatus, MessageType, PaymentStatus } from "./enums"

export type Tour = {
	id: string
	destination: string // Название направления (город, страна)
	shortDescription: string // Краткое описание тура
	fullDescription?: string // Полное описание тура (опционально)
	properties: string[] // Перечисление услуг и удобств тура
	price: number // Цена тура в рублях
	image: string // URL изображения тура
	tags: string[] // Теги/категории тура
	rating: number // Рейтинг тура (от 0 до 5)
	duration?: number // Длительность в днях
	maxPartySize?: number // Максимальное количество участников
	minPartySize?: number // Минимальное количество участников
	available?: boolean // Доступность тура
	createdAt?: string // Дата создания
	updatedAt?: string // Дата последнего обновления
}

export type Booking = {
	id: string
	userId: string // ID пользователя, создавшего бронь
	tourId: string // ID забронированного тура
	status: BookingStatus // Статус бронирования
	partySize: number // Количество участников
	notes?: string // Заметки от клиента
	createdAt: string // Дата создания бронирования
	updatedAt?: string // Дата обновления бронирования
	startDate?: string // Желаемая дата начала тура
	paymentStatus?: PaymentStatus // Статус оплаты
	totalAmount?: number // Сумма к оплате
}

export type Message = {
	id: string
	bookingId: string // ID бронирования, к которому относится сообщение
	authorId: string // ID автора сообщения
	authorName?: string | null // Имя автора (опционально, для удобства отображения)
	text: string // Текст сообщения
	type?: MessageType // Тип сообщения
	createdAt: string // Дата создания сообщения
	isRead?: boolean // Прочитано ли сообщение
	readByMe?: boolean // Прочитано текущим пользователем
	attachments?: Array<string | Record<string, unknown>> // Вложения (опционально)
}

export type User = {
	id: string
	email: string // Email пользователя
	name?: string | null // Имя пользователя
	role: Role // Роль пользователя
	avatar?: string | null // Аватар пользователя
	phone?: string | null // Номер телефона
	createdAt?: string // Дата создания аккаунта
	status?: "active" | "blocked" // Статус менеджера/аккаунта
	lastLoginAt?: string | null // Последний вход
	invitedAt?: string | null // Дата приглашения
	invitedBy?: string | null // Кто пригласил
	password?: string | null // Текущий пароль (для внутренних сценариев)
}

export type ManagerStatus = "active" | "blocked"

export type CreateManagerInput = {
	email: string
	name?: string
	phone?: string
	password?: string
	status?: ManagerStatus
	role?: Role
}

export type UpdateManagerInput = {
	name?: string
	phone?: string
	status?: ManagerStatus
	role?: Role
	password?: string
}

export type TourFilters = {
	search?: string // Поиск по тексту
	tags?: string[] // Фильтр по тегам
	minPrice?: number // Минимальная цена
	maxPrice?: number // Максимальная цена
	minRating?: number // Минимальный рейтинг
	sortBy?: "price" | "rating" | "createdAt" // Сортировка
	sortOrder?: "asc" | "desc" // Направление сортировки
	page?: number // Номер страницы для пагинации
	limit?: number // Количество элементов на странице
}

export type CreateBookingInput = {
	tourId: string
	partySize: number // Количество участников
	startDate?: string // Желаемая дата начала
	notes?: string // Заметки
	userId?: string // Для MANAGER/ADMIN
}

export type UpdateBookingInput = {
	status?: BookingStatus // Статус
	partySize?: number // Количество участников
	notes?: string // Заметки
	paymentStatus?: PaymentStatus // Статус оплаты
}

export type CreateMessageInput = {
	bookingId: string // ID бронирования
	text: string // Текст сообщения
	type?: MessageType // Тип сообщения
	attachments?: Array<string | Record<string, unknown>>
}
