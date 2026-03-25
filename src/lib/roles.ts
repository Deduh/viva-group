export const ROLES = ["CLIENT", "AGENT", "MANAGER", "ADMIN"] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
	CLIENT: "Клиент",
	AGENT: "Турагент",
	MANAGER: "Менеджер",
	ADMIN: "Админ",
}
