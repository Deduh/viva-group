import type { Role } from "@/lib/roles"
import type { BookingStatus, MessageType, PaymentStatus } from "./enums"

export type FullDescriptionBlock = {
	title: string
	items: string[]
}

export type Tour = {
	id: string
	publicId?: string // Публичный ID тура
	title: string // Название тура
	shortDescription: string // Краткое описание тура
	fullDescriptionBlocks: FullDescriptionBlock[] // Полное описание тура (блоки)
	price: number // Цена тура в рублях
	image: string // URL изображения тура
	tags: string[] // Визуальные теги тура
	categories: string[] // Категории для фильтрации
	dateFrom?: string // Дата начала тура
	dateTo?: string // Дата окончания тура
	durationDays?: number // Длительность в днях
	durationNights?: number // Длительность в ночах
	available?: boolean // Доступность тура
	createdAt?: string // Дата создания
	updatedAt?: string // Дата последнего обновления
}

export type Participant = {
	fullName: string
	birthDate: string
	gender: "male" | "female"
	passportNumber: string
}

export type Booking = {
	id: string
	publicId?: string // Публичный ID бронирования
	userId: string // ID пользователя, создавшего бронь
	tourId: string // ID забронированного тура
	tourPublicId?: string // Публичный ID тура (если отдается бэкендом)
	status: BookingStatus // Статус бронирования
	participants: Participant[] // Список участников
	notes?: string // Заметки от клиента
	createdAt: string // Дата создания бронирования
	updatedAt?: string // Дата обновления бронирования
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
	categories?: string[] // Фильтр по категориям
	minPrice?: number // Минимальная цена
	maxPrice?: number // Максимальная цена
	sortBy?: "price" | "createdAt" | "title" // Сортировка
	sortOrder?: "asc" | "desc" // Направление сортировки
	page?: number // Номер страницы для пагинации
	limit?: number // Количество элементов на странице
}

export type CreateBookingInput = {
	tourId: string
	participants: Participant[] // Список участников
	notes?: string // Заметки
	userId?: string // Для MANAGER/ADMIN
}

export type UpdateBookingInput = {
	status?: BookingStatus // Статус
	participants?: Participant[] // Список участников
	notes?: string // Заметки
	paymentStatus?: PaymentStatus // Статус оплаты
}

export type CreateMessageInput = {
	bookingId: string // ID бронирования
	text: string // Текст сообщения
	type?: MessageType // Тип сообщения
	attachments?: Array<string | Record<string, unknown>>
}
