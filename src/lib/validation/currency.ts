import { z } from "zod"

const currencyCodeSchema = z.enum(["RUB", "USD", "EUR", "CNY"])

export const currencyRateSchema = z.object({
	currency: currencyCodeSchema,
	rate: z
		.number()
		.positive("Курс должен быть положительным")
		.min(0.000001, "Курс должен быть больше 0"),
	markupPercent: z
		.number()
		.min(0, "Наценка не может быть отрицательной")
		.max(1000, "Наценка слишком большая"),
})

export const currencySettingsUpdateSchema = z.object({
	baseCurrency: currencyCodeSchema,
	rates: z.array(currencyRateSchema).min(1, "Нужен хотя бы один курс валют"),
})

export type CurrencySettingsUpdateSchemaInput = z.infer<
	typeof currencySettingsUpdateSchema
>
