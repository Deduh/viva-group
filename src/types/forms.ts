import type { CurrencyCode } from "./api"

export type TourFormBlock = {
	title: string
	items: string[]
}

export type TourHotelFormValue = {
	name: string
	stars: number | ""
	note?: string
	basePrice: number | ""
	baseCurrency: CurrencyCode
}

export type TourFormValues = {
	title: string
	shortDescription: string
	fullDescriptionBlocks: TourFormBlock[]
	programText?: string
	price: number
	baseCurrency: CurrencyCode
	image: string
	tags: string[]
	categories: string[]
	hasHotelOptions: boolean
	hotels: TourHotelFormValue[]
	dateFrom?: string
	dateTo?: string
	durationDays?: number | ""
	durationNights?: number | ""
	available: boolean
}
