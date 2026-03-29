import type { FullDescriptionBlock } from "@/types"

export type ParsedProgramDay = {
	id: string
	title: string
	subtitle?: string
	items: string[]
}

export type ParsedProgramFallbackSection = {
	id: string
	title?: string
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
const SPLIT_ITEMS_REGEX = /\s*(?:[;•●▪◦])\s*/g
const GENERIC_SECTION_TITLE_REGEX = /^(?:block|блок)\s*#?\s*\d+$/i

function normalizeLine(line: string) {
	return line.replace(/\s+/g, " ").trim()
}

function splitToItems(lines: string[]) {
	return lines
		.flatMap(line =>
			line
				.split(SPLIT_ITEMS_REGEX)
				.map(item => normalizeLine(item))
				.filter(Boolean),
		)
		.map(item => item.replace(BULLET_REGEX, "").trim())
		.filter(Boolean)
}

function normalizeSectionTitle(value?: string) {
	const normalized = normalizeLine(value || "")

	if (!normalized) return undefined
	if (GENERIC_SECTION_TITLE_REGEX.test(normalized)) return undefined

	return normalized
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

				const extractedTitle =
					lines.length > 1 &&
					!BULLET_REGEX.test(lines[0]) &&
					lines[0].length <= 80 &&
					!/[.!?;:]$/.test(lines[0])
						? lines[0]
						: undefined
				const contentLines = extractedTitle ? lines.slice(1) : lines
				const items = splitToItems(contentLines)

				if (items.length === 0) return null

				return {
					id: `program-${index + 1}`,
					title: normalizeSectionTitle(extractedTitle),
					items,
				}
			})
			.filter(Boolean) as ParsedProgramFallbackSection[]

		return {
			days: [],
			fallbackSections,
			hasStructuredDays: false,
		}
	}

	const fallbackSections = legacyBlocks
		.map((block, index) => ({
			id: `legacy-${index + 1}`,
			title: normalizeSectionTitle(block.title),
			items: block.items.filter(Boolean),
		}))
		.filter(section => section.items.length > 0)

	return {
		days: [],
		fallbackSections,
		hasStructuredDays: false,
	}
}
