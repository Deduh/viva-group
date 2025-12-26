import { BookingStatus } from "@/types/enums"
import { z } from "zod"

export const bookingSchema = z.object({
	tourId: z.string().min(1, "Выберите тур"),
	partySize: z
		.number({ message: "Количество должно быть числом" })
		.int("Количество должно быть целым числом")
		.min(1, "Минимум 1 человек")
		.max(20, "Максимум 20 человек"),
	startDate: z
		.string()
		.min(1, "Укажите дату начала")
		.refine(
			date => {
				const selectedDate = new Date(date)
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				return selectedDate >= today
			},
			{
				message: "Дата должна быть сегодня или в будущем",
			}
		),
	notes: z
		.string()
		.max(500, "Заметки не должны превышать 500 символов")
		.optional()
		.or(z.literal("")),
})

export type BookingInput = z.infer<typeof bookingSchema>

export const bookingStatusUpdateSchema = z.object({
	id: z.string().min(1, "ID бронирования обязателен"),
	status: z.enum(
		Object.values(BookingStatus) as [BookingStatus, ...BookingStatus[]],
		{
			message: "Некорректный статус бронирования",
		}
	),
})

export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>
