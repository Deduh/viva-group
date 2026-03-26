import type { CurrencyCode, CurrencySettings } from "@/types"

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["RUB", "USD", "EUR", "CNY"]
export const CBR_DAILY_RATES_URL = "https://www.cbr-xml-daily.ru/daily_json.js"

export const CURRENCY_LABEL: Record<CurrencyCode, string> = {
	RUB: "RUB",
	USD: "USD",
	EUR: "EUR",
	CNY: "CNY",
}

export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
	RUB: "ru-RU",
	USD: "en-US",
	EUR: "de-DE",
	CNY: "zh-CN",
}

type CbrDailyValute = {
	CharCode: string
	Nominal: number
	Value: number
	Previous: number
}

type CbrDailyResponse = {
	Date?: string
	Valute?: Record<string, CbrDailyValute>
}

export type CurrencyMarketRate = {
	currency: CurrencyCode
	rate: number
	previousRate?: number
	nominal?: number
}

export type CurrencyMarketSnapshot = {
	rates: CurrencyMarketRate[]
	updatedAt: string
	sourceUrl: string
}

export type CurrencyQuote = {
	id: "USD" | "CNY"
	label: string
	symbol: string
	value: number
}

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
	baseCurrency: "RUB",
	rates: [
		{ currency: "RUB", rate: 1, markupPercent: 0 },
		{ currency: "USD", rate: 92, markupPercent: 5 },
		{ currency: "EUR", rate: 100, markupPercent: 5 },
		{ currency: "CNY", rate: 12.7, markupPercent: 4 },
	],
	updatedAt: "2026-03-24T00:00:00.000Z",
}

export const DEFAULT_CURRENCY_MARKET_SNAPSHOT: CurrencyMarketSnapshot = {
	rates: [
		{ currency: "RUB", rate: 1, previousRate: 1, nominal: 1 },
		{ currency: "USD", rate: 92, previousRate: 92, nominal: 1 },
		{ currency: "EUR", rate: 100, previousRate: 100, nominal: 1 },
		{ currency: "CNY", rate: 12.7, previousRate: 12.7, nominal: 1 },
	],
	updatedAt: DEFAULT_CURRENCY_SETTINGS.updatedAt,
	sourceUrl: CBR_DAILY_RATES_URL,
}

function roundCurrencyRate(value: number) {
	return Math.round(value * 10000) / 10000
}

function normalizeCbrRate(valute?: CbrDailyValute): CurrencyMarketRate | undefined {
	if (!valute || !valute.Nominal || !valute.Value) return undefined

	return {
		currency: valute.CharCode as CurrencyCode,
		rate: roundCurrencyRate(valute.Value / valute.Nominal),
		previousRate:
			typeof valute.Previous === "number"
				? roundCurrencyRate(valute.Previous / valute.Nominal)
				: undefined,
		nominal: valute.Nominal,
	}
}

export async function fetchCbrCurrencyMarketSnapshot(): Promise<CurrencyMarketSnapshot> {
	const response = await fetch(CBR_DAILY_RATES_URL, {
		headers: {
			Accept: "application/json",
		},
	})

	if (!response.ok) {
		throw new Error(`Не удалось загрузить курсы ЦБ РФ: ${response.status}`)
	}

	const data = (await response.json()) as CbrDailyResponse
	const usdRate = normalizeCbrRate(data.Valute?.USD)
	const eurRate = normalizeCbrRate(data.Valute?.EUR)
	const cnyRate = normalizeCbrRate(data.Valute?.CNY)

	return {
		rates: [
			{ currency: "RUB", rate: 1, previousRate: 1, nominal: 1 },
			usdRate ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT.rates[1],
			eurRate ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT.rates[2],
			cnyRate ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT.rates[3],
		],
		updatedAt: data.Date ?? new Date().toISOString(),
		sourceUrl: CBR_DAILY_RATES_URL,
	}
}

export function getCurrencyRateToRub(
	source: Pick<CurrencySettings, "rates"> | CurrencyMarketSnapshot,
	currency: CurrencyCode,
) {
	if (currency === "RUB") return 1

	return source.rates.find(rate => rate.currency === currency)?.rate ?? 1
}

export function getCurrencyMarkup(
	settings: CurrencySettings,
	currency: CurrencyCode,
) {
	return settings.rates.find(rate => rate.currency === currency)?.markupPercent ?? 0
}

export function getEffectiveCurrencyRateToRub(
	settings: CurrencySettings,
	currency: CurrencyCode,
) {
	if (currency === "RUB") return 1

	const rateToRub = getCurrencyRateToRub(settings, currency)
	const markupPercent = getCurrencyMarkup(settings, currency)

	return rateToRub * (1 + markupPercent / 100)
}

export function convertCurrencyAmount(
	amount: number,
	fromCurrency: CurrencyCode,
	toCurrency: CurrencyCode,
	settings: CurrencySettings,
) {
	const fromRateToRub = getEffectiveCurrencyRateToRub(settings, fromCurrency)
	const toRateToRub = getEffectiveCurrencyRateToRub(settings, toCurrency)
	const rubAmount = amount * fromRateToRub

	return rubAmount / toRateToRub
}

export function mergeCurrencySettingsWithMarket(
	settings?: CurrencySettings | null,
	market?: CurrencyMarketSnapshot | null,
): CurrencySettings {
	const resolvedSettings = resolveCurrencySettings(settings)
	const resolvedMarket = market ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT

	return {
		baseCurrency: resolvedSettings.baseCurrency,
		rates: SUPPORTED_CURRENCIES.map(currency => {
			const marketRate =
				resolvedMarket.rates.find(rate => rate.currency === currency)?.rate ??
				getCurrencyRateToRub(resolvedSettings, currency)
			const markupPercent =
				resolvedSettings.rates.find(rate => rate.currency === currency)
					?.markupPercent ?? 0

			return {
				currency,
				rate: marketRate,
				markupPercent,
			}
		}),
		updatedAt: resolvedMarket.updatedAt ?? resolvedSettings.updatedAt,
	}
}

export function buildCurrencyQuotes(
	source: Pick<CurrencySettings, "rates"> | CurrencyMarketSnapshot,
): CurrencyQuote[] {
	return [
		{
			id: "USD",
			label: "USD",
			symbol: "$",
			value: getCurrencyRateToRub(source, "USD"),
		},
		{
			id: "CNY",
			label: "CNY",
			symbol: "¥",
			value: getCurrencyRateToRub(source, "CNY"),
		},
	]
}

export function resolveCurrencySettings(
	settings?: CurrencySettings | null,
): CurrencySettings {
	if (!settings) return DEFAULT_CURRENCY_SETTINGS

	const normalizedRates = SUPPORTED_CURRENCIES.map(currency => {
		const existing = settings.rates.find(rate => rate.currency === currency)

		if (existing) return existing

		const fallback = DEFAULT_CURRENCY_SETTINGS.rates.find(
			rate => rate.currency === currency,
		)

		return (
			fallback ?? {
				currency,
				rate: currency === "RUB" ? 1 : 1,
				markupPercent: 0,
			}
		)
	})

	return {
		baseCurrency: settings.baseCurrency ?? DEFAULT_CURRENCY_SETTINGS.baseCurrency,
		rates: normalizedRates,
		updatedAt: settings.updatedAt ?? DEFAULT_CURRENCY_SETTINGS.updatedAt,
	}
}
