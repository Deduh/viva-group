import { CHARTER_CATEGORIES } from "@/lib/charter-categories"
import { z } from "zod"

const charterCategoryEnum = z.enum(
	CHARTER_CATEGORIES as unknown as [string, ...string[]],
)

const weekDaySchema = z.coerce
	.number()
	.int("День недели должен быть целым числом")
	.min(1, "День недели должен быть в диапазоне 1..7")
	.max(7, "День недели должен быть в диапазоне 1..7")

const baseSchema = z.object({
	from: z.string().trim().min(1, "Укажите город отправления").max(120),
	to: z.string().trim().min(1, "Укажите город назначения").max(120),
	dateFrom: z.string().min(1, "Укажите дату начала периода"),
	dateTo: z.string().min(1, "Укажите дату конца периода"),
	weekDays: z
		.array(weekDaySchema)
		.min(1, "Выберите хотя бы один день недели")
		.refine(arr => new Set(arr).size === arr.length, {
			message: "Дни недели не должны повторяться",
		}),
	categories: z.array(charterCategoryEnum).default([]),
	seatsTotal: z.coerce
		.number()
		.int("Количество мест должно быть целым числом")
		.min(1, "Количество мест должно быть минимум 1"),
	hasBusinessClass: z.coerce.boolean().default(false),
	hasComfortClass: z.coerce.boolean().default(false),
})

const validateDateOrder = (
	data: { dateFrom?: string; dateTo?: string },
	ctx: z.RefinementCtx,
) => {
	if (!data.dateFrom || !data.dateTo) return

	const left = new Date(data.dateFrom).getTime()
	const right = new Date(data.dateTo).getTime()

	if (Number.isNaN(left)) {
		ctx.addIssue({
			code: "custom",
			path: ["dateFrom"],
			message: "Некорректная дата начала периода",
		})
	}

	if (Number.isNaN(right)) {
		ctx.addIssue({
			code: "custom",
			path: ["dateTo"],
			message: "Некорректная дата конца периода",
		})
	}

	if (!Number.isNaN(left) && !Number.isNaN(right) && left > right) {
		ctx.addIssue({
			code: "custom",
			path: ["dateTo"],
			message: "Дата конца периода должна быть не раньше начала",
		})
	}
}

export const charterFlightCreateSchema =
	baseSchema.superRefine(validateDateOrder)

export const charterFlightUpdateSchema = baseSchema
	.partial()
	.extend({
		isActive: z.coerce.boolean().optional(),
	})
	.superRefine(validateDateOrder)

export type CharterFlightCreateInput = z.infer<typeof charterFlightCreateSchema>
export type CharterFlightUpdateInput = z.infer<typeof charterFlightUpdateSchema>
