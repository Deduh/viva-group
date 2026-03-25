import type { FullDescriptionBlock } from "@/types"

export type ParsedProgramDay = {
	id: string
	title: string
	subtitle?: string
	items: string[]
}

export type ParsedProgramFallbackSection = {
	id: string
	title: string
	items: string[]
}

export type ParsedTourProgram = {
	days: ParsedProgramDay[]
	fallbackSections: ParsedProgramFallbackSection[]
	hasStructuredDays: boolean
}

const DAY_REGEX =
	/^\s*(?:(?:день)\s*(\d+)|(\d+)\s*д(?:е|ё)нь|day\s*(\d+))[\s.:,-]*(.*)$/i

const BULLET_REGEX = /^\s*(?:[-*•●▪◦–—]|\d+[.)])\s+/

function normalizeLine(line: string) {
	return line.replace(/\s+/g, " ").trim()
}

function splitToItems(lines: string[]) {
	return lines
		.flatMap(line =>
			line
				.split(/\s*(?:[;•●▪◦])\s*/g)
				.map(item => normalizeLine(item))
				.filter(Boolean),
		)
		.map(item => item.replace(BULLET_REGEX, "").trim())
		.filter(Boolean)
}

export function parseTourProgram(
	programText?: string,
	legacyBlocks: FullDescriptionBlock[] = [],
): ParsedTourProgram {
	const normalizedText = (programText ?? "").replace(/\r/g, "").trim()

	if (normalizedText) {
		const rawLines = normalizedText.split("\n")
		const days: ParsedProgramDay[] = []
		let currentDay: ParsedProgramDay | null = null
		let buffer: string[] = []

		const flushDay = () => {
			if (!currentDay) return

			currentDay.items = splitToItems(buffer)
			days.push(currentDay)
			buffer = []
		}

		for (const rawLine of rawLines) {
			const line = normalizeLine(rawLine)

			if (!line) continue

			const match = line.match(DAY_REGEX)

			if (match) {
				flushDay()

				const dayNumber = match[1] || match[2] || match[3]
				const subtitle = normalizeLine(match[4] || "")

				currentDay = {
					id: `day-${dayNumber || days.length + 1}`,
					title: dayNumber ? `День ${dayNumber}` : `День ${days.length + 1}`,
					subtitle: subtitle || undefined,
					items: [],
				}

				continue
			}

			if (currentDay) {
				buffer.push(line)
			}
		}

		flushDay()

		if (days.length > 0) {
			return {
				days,
				fallbackSections: [],
				hasStructuredDays: true,
			}
		}

		const fallbackSections = normalizedText
			.split(/\n{2,}/)
			.map((chunk, index) => {
				const lines = chunk
					.split("\n")
					.map(line => normalizeLine(line))
					.filter(Boolean)

				if (lines.length === 0) return null

				return {
					id: `program-${index + 1}`,
					title: index === 0 ? "Программа тура" : `Блок ${index + 1}`,
					items: splitToItems(lines),
				}
			})
			.filter(Boolean) as ParsedProgramFallbackSection[]

		return {
			days: [],
			fallbackSections,
			hasStructuredDays: false,
		}
	}

	const fallbackSections = legacyBlocks.map((block, index) => ({
		id: `legacy-${index + 1}`,
		title: block.title,
		items: block.items.filter(Boolean),
	}))

	return {
		days: [],
		fallbackSections,
		hasStructuredDays: false,
	}
}
