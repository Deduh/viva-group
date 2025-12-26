export enum BookingStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	CANCELLED = "CANCELLED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
}

export enum TourCategory {
	EUROPE = "Европа",
	ASIA = "Азия",
	AFRICA = "Африка",
	AMERICA = "Америка",
	SEA = "Море",
	MOUNTAINS = "Горы",
	CITY = "Город",
	NATURE = "Природа",
	CULTURE = "Культура",
	SAFARI = "Сафари",
	PREMIUM = "Премиум",
	ACTIVE = "Активный",
	WINTER = "Зима",
	EXOTIC = "Экзотика",
}

export enum UserRole {
	CLIENT = "CLIENT",
	MANAGER = "MANAGER",
	ADMIN = "ADMIN",
}

export enum MessageType {
	TEXT = "TEXT",
	IMAGE = "IMAGE",
	FILE = "FILE",
	SYSTEM = "SYSTEM",
	NOTIFICATION = "NOTIFICATION",
}

export enum PaymentStatus {
	PENDING = "PENDING",
	PAID = "PAID",
	FAILED = "FAILED",
	REFUNDED = "REFUNDED",
}
