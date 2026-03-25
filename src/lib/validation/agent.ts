import { z } from "zod"

export const agentApplicationCreateSchema = z.object({
	companyName: z
		.string()
		.min(2, "Название компании должно содержать минимум 2 символа")
		.max(120, "Название компании слишком длинное"),
	contactName: z
		.string()
		.min(2, "Имя контактного лица должно содержать минимум 2 символа")
		.max(120, "Имя контактного лица слишком длинное"),
	email: z.email("Некорректный email адрес"),
	phone: z
		.string()
		.min(6, "Укажите телефон")
		.max(40, "Телефон слишком длинный"),
	website: z
		.string()
		.max(200, "Сайт слишком длинный")
		.optional()
		.or(z.literal("")),
	city: z
		.string()
		.max(120, "Название города слишком длинное")
		.optional()
		.or(z.literal("")),
	comment: z
		.string()
		.max(1000, "Комментарий слишком длинный")
		.optional()
		.or(z.literal("")),
})

export const agentApplicationStatusUpdateSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"]),
	rejectionReason: z
		.string()
		.max(500, "Причина отклонения слишком длинная")
		.optional()
		.or(z.literal("")),
})

export type AgentApplicationCreateInput = z.infer<
	typeof agentApplicationCreateSchema
>
export type AgentApplicationStatusUpdateInput = z.infer<
	typeof agentApplicationStatusUpdateSchema
>
