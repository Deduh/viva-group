import { z } from "zod"

export const contactSchema = z.object({
	name: z
		.string()
		.min(2, "Имя должно содержать минимум 2 символа")
		.max(50, "Имя не должно превышать 50 символов"),
	email: z.email("Некорректный email адрес"),
	phone: z
		.string()
		.optional()
		.or(z.literal(""))
		.refine(
			val => !val || val.length >= 10,
			"Номер телефона должен содержать минимум 10 цифр"
		),
	message: z
		.string()
		.min(10, "Сообщение должно содержать минимум 10 символов")
		.max(1000, "Сообщение не должно превышать 1000 символов"),
})

export type ContactInput = z.infer<typeof contactSchema>
