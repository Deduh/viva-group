import { z } from "zod"

export const loginSchema = z.object({
	email: z.email("Некорректный email адрес"),
	password: z.string().min(1, "Пароль обязателен"),
})

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(2, "Имя должно содержать минимум 2 символа")
			.max(50, "Имя не должно превышать 50 символов"),
		email: z.email("Некорректный email адрес"),
		password: z
			.string()
			.min(8, "Пароль должен содержать минимум 8 символов")
			.regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
			.regex(/[a-z]/, "Пароль должен содержать хотя бы одну строчную букву")
			.regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),
		confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
