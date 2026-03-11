import { CHARTER_CATEGORIES } from "@/lib/charter-categories"
import { z } from "zod"

const charterCategoryEnum = z.enum(
	CHARTER_CATEGORIES as unknown as [string, ...string[]],
)
const charterTripTypeEnum = z.enum(["ONE_WAY", "ROUND_TRIP"])

export const charterFlightsSearchSchema = z
	.object({
		tripType: charterTripTypeEnum.default("ROUND_TRIP"),
		from: z.string().trim().min(1, "Укажите город отправления").max(120),
		to: z.string().trim().min(1, "Укажите город назначения").max(120),
		dateFrom: z.string().min(1, "Укажите дату вылета"),
		dateTo: z.preprocess(
			value =>
				typeof value === "string" && value.trim() === "" ? undefined : value,
			z.string().min(1, "Укажите дату возвращения").optional(),
		),
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
		hasSeats: z.coerce.boolean().default(true),
		hasBusinessClass: z.coerce.boolean().default(false),
		hasComfortClass: z.coerce.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		const left = new Date(data.dateFrom).getTime()
		const right =
			typeof data.dateTo === "string" ? new Date(data.dateTo).getTime() : null

		if (Number.isNaN(left)) {
			ctx.addIssue({
				code: "custom",
				path: ["dateFrom"],
				message: "Некорректная дата вылета",
			})
		}

		if (data.tripType === "ROUND_TRIP" && !data.dateTo) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Укажите дату возвращения",
			})
		}

		if (
			data.tripType === "ONE_WAY" &&
			typeof data.dateTo === "string" &&
			data.dateTo.length > 0
		) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Для перелета в одну сторону дата возврата не нужна",
			})
		}

		if (
			data.tripType === "ROUND_TRIP" &&
			right !== null &&
			Number.isNaN(right)
		) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Некорректная дата возвращения",
			})
		}

		if (
			data.tripType === "ROUND_TRIP" &&
			right !== null &&
			!Number.isNaN(left) &&
			!Number.isNaN(right) &&
			left > right
		) {
			ctx.addIssue({
				code: "custom",
				path: ["dateTo"],
				message: "Дата возвращения должна быть позже даты вылета",
			})
		}
	})

export type CharterFlightsSearchInput = z.infer<
	typeof charterFlightsSearchSchema
>
