import { BookingStatus } from "@/types/enums"
import { z } from "zod"

export const participantSchema = z.object({
	fullName: z.string().min(1, "Укажите ФИО"),
	birthDate: z.string().min(1, "Укажите дату рождения"),
	gender: z.enum(["male", "female"], {
		error: () => ({ message: "Выберите пол" }),
	}),
	passportNumber: z.string().min(1, "Укажите номер загранпаспорта"),
})

export const bookingSchema = z.object({
	tourId: z.string().min(1, "Выберите тур"),
	participants: z.array(participantSchema).min(1, "Минимум 1 участник"),
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
		},
	),
})

export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>
