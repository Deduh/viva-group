import { BookingStatus } from "@/types/enums"

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
	PENDING: "Ожидает подтверждения",
	CONFIRMED: "Подтверждено",
	CANCELLED: "Отменено",
	IN_PROGRESS: "В процессе",
	COMPLETED: "Завершено",
}

export const BOOKING_STATUS_COLOR: Record<BookingStatus, string> = {
	PENDING: "#f59e0b",
	CONFIRMED: "#10b981",
	CANCELLED: "#ef4444",
	IN_PROGRESS: "#3b82f6",
	COMPLETED: "#8b5cf6",
}
