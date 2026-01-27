export type TourFormBlock = {
	title: string
	items: string[]
}

export type TourFormValues = {
	title: string
	shortDescription: string
	fullDescriptionBlocks: TourFormBlock[]
	price: number
	image: string
	tags: string[]
	categories: string[]
	dateFrom?: string
	dateTo?: string
	durationDays?: number | ""
	durationNights?: number | ""
	available: boolean
}
