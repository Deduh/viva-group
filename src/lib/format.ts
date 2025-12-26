export function formatDate(input: string, locale = "ru-RU") {
	const date = new Date(input)

	if (Number.isNaN(date.getTime())) return input

	return date.toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

export function formatTime(input: string, locale = "ru-RU") {
	const date = new Date(input)

	if (Number.isNaN(date.getTime())) return input

	return date.toLocaleTimeString(locale, {
		hour: "2-digit",
		minute: "2-digit",
	})
}

export function formatCurrency(
	value: number,
	currency = "RUB",
	locale = "ru-RU"
) {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(value)
}

function formatRuPhoneNumber(digits: string) {
	let normalized = digits

	if (normalized.startsWith("8")) {
		normalized = `7${normalized.slice(1)}`
	} else if (!normalized.startsWith("7")) {
		normalized = `7${normalized}`
	}

	const numbers = normalized.slice(1, 11)
	const area = numbers.slice(0, 3)
	const first = numbers.slice(3, 6)
	const second = numbers.slice(6, 8)
	const third = numbers.slice(8, 10)

	let result = "+7"

	if (area) result += ` ${area}`
	if (first) result += ` ${first}`
	if (second) result += `-${second}`
	if (third) result += `-${third}`

	return result
}

function formatChinaPhoneNumber(digits: string) {
	const normalized = digits.startsWith("86") ? digits : `86${digits}`
	const rest = normalized.slice(2, 13)
	const part1 = rest.slice(0, 3)
	const part2 = rest.slice(3, 7)
	const part3 = rest.slice(7, 11)

	let result = "+86"

	if (part1) result += ` ${part1}`
	if (part2) result += ` ${part2}`
	if (part3) result += ` ${part3}`

	return result
}

function formatInternationalPhoneNumber(digits: string) {
	const capped = digits.slice(0, 15)

	if (capped.startsWith("7") && capped.length <= 11) {
		return formatRuPhoneNumber(capped)
	}

	if (capped.startsWith("86")) {
		return formatChinaPhoneNumber(capped)
	}

	return `+${capped}`
}

export function formatPhoneNumber(value: string) {
	const trimmed = value.trim()
	const hasPlus = trimmed.startsWith("+")
	const digits = trimmed.replace(/\D/g, "")

	if (!digits) return hasPlus ? "+" : ""

	if (hasPlus) {
		return formatInternationalPhoneNumber(digits)
	}

	if (digits.startsWith("7") || digits.startsWith("8")) {
		return formatRuPhoneNumber(digits)
	}

	if (digits.startsWith("86")) {
		return formatChinaPhoneNumber(digits)
	}

	return `+${digits.slice(0, 15)}`
}
