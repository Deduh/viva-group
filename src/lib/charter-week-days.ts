export const CHARTER_WEEK_DAY_LABEL: Record<number, string> = {
	1: "Пн",
	2: "Вт",
	3: "Ср",
	4: "Чт",
	5: "Пт",
	6: "Сб",
	7: "Вс",
}

export const CHARTER_WEEK_DAYS = [
	{ value: 1, label: "Пн" },
	{ value: 2, label: "Вт" },
	{ value: 3, label: "Ср" },
	{ value: 4, label: "Чт" },
	{ value: 5, label: "Пт" },
	{ value: 6, label: "Сб" },
	{ value: 7, label: "Вс" },
] as const

export const formatCharterWeekDays = (weekDays: number[]) => {
	if (!weekDays || weekDays.length === 0) return "Не указано"

	return [...weekDays]
		.sort((a, b) => a - b)
		.map(day => CHARTER_WEEK_DAY_LABEL[day] || String(day))
		.join(", ")
}
