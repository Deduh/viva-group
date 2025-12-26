export const ROLES = ["CLIENT", "MANAGER", "ADMIN"] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
	CLIENT: "Клиент",
	MANAGER: "Менеджер",
	ADMIN: "Админ",
}
