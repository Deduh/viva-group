import { CHARTER_CATEGORIES } from "@/lib/charter-categories"
import { CHARTER_FROM_CITIES, CHARTER_TO_CITIES } from "@/lib/charter-cities"
import { z } from "zod"

const charterCategoryEnum = z.enum(
	CHARTER_CATEGORIES as unknown as [string, ...string[]],
)

export const charterBookingCreateSchema = z
	.object({
		from: z
			.string()
			.trim()
			.min(1, "Укажите город отправления")
			.max(120)
			.refine(v => (CHARTER_FROM_CITIES as readonly string[]).includes(v), {
				message: "Выберите город отправления из списка",
			}),
		to: z
			.string()
			.trim()
			.min(1, "Укажите город назначения")
			.max(120)
			.refine(v => (CHARTER_TO_CITIES as readonly string[]).includes(v), {
				message: "Выберите город назначения из списка",
			}),
		dateFrom: z.string().min(1, "Укажите дату вылета"),
		dateTo: z.string().min(1, "Укажите дату возвращения"),
		adults: z.coerce
			.number()
			.int("Количество взрослых должно быть целым числом")
			.min(1, "Количество взрослых должно быть минимум 1"),
		children: z.coerce
			.number()
			.int("Количество детей должно быть целым числом")
			.min(0, "Количество детей не может быть отрицательным")
			.default(0),
		categories: z.array(charterCategoryEnum).default([]),
	})
	.superRefine((data, ctx) => {
		const left = new Date(data.dateFrom).getTime()
		const right = new Date(data.dateTo).getTime()

		if (Number.isNaN(left)) {
			ctx.addIssue({
				code: "custom",
				path: ["dateFrom"],
				message: "Некорректная дата вылета",
			})
		}

		if (Number.isNaN(right)) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Некорректная дата возвращения",
			})
		}

		if (!Number.isNaN(left) && !Number.isNaN(right) && left > right) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Дата возвращения должна быть позже даты вылета",
			})
		}
	})

export type CharterBookingCreateInput = z.infer<
	typeof charterBookingCreateSchema
>
