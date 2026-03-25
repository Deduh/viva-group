"use client"

import { api } from "@/lib/api"
import {
	buildCurrencyQuotes,
	CURRENCY_LOCALE,
	DEFAULT_CURRENCY_SETTINGS,
	convertCurrencyAmount,
	DEFAULT_CURRENCY_MARKET_SNAPSHOT,
	fetchCbrCurrencyMarketSnapshot,
	mergeCurrencySettingsWithMarket,
	type CurrencyMarketSnapshot,
	type CurrencyQuote,
	SUPPORTED_CURRENCIES,
} from "@/lib/currency"
import { formatCurrency as formatCurrencyValue } from "@/lib/format"
import type { CurrencyCode, CurrencySettings } from "@/types"
import { useQuery } from "@tanstack/react-query"
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react"

type CurrencyContextValue = {
	selectedCurrency: CurrencyCode
	setSelectedCurrency: (currency: CurrencyCode) => void
	settings: CurrencySettings
	market: CurrencyMarketSnapshot
	quotes: CurrencyQuote[]
	isLoading: boolean
	convertPrice: (value: number, baseCurrency?: CurrencyCode) => number
	formatPrice: (value: number, baseCurrency?: CurrencyCode) => string
}

const STORAGE_KEY = "viva-selected-currency"

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
	const [selectedCurrency, setSelectedCurrencyState] =
		useState<CurrencyCode>("RUB")

	const { data, isLoading } = useQuery({
		queryKey: ["currencySettings"],
		queryFn: async () => {
			try {
				return await api.getCurrencySettings()
			} catch {
				return DEFAULT_CURRENCY_SETTINGS
			}
		},
	})

	const marketQuery = useQuery({
		queryKey: ["cbrCurrencyMarket"],
		queryFn: fetchCbrCurrencyMarketSnapshot,
		staleTime: 1000 * 60 * 60 * 6,
		retry: 1,
	})

	const market = useMemo(
		() => marketQuery.data ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT,
		[marketQuery.data],
	)

	const settings = useMemo(
		() => mergeCurrencySettingsWithMarket(data, market),
		[data, market],
	)

	const quotes = useMemo(() => buildCurrencyQuotes(market), [market])

	useEffect(() => {
		if (typeof window === "undefined") return

		const saved = window.localStorage.getItem(STORAGE_KEY)

		if (!saved) return

		if (SUPPORTED_CURRENCIES.includes(saved as CurrencyCode)) {
			setSelectedCurrencyState(saved as CurrencyCode)
		}
	}, [])

	const setSelectedCurrency = (currency: CurrencyCode) => {
		setSelectedCurrencyState(currency)

		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, currency)
		}
	}

	const value = useMemo<CurrencyContextValue>(() => {
		return {
			selectedCurrency,
			setSelectedCurrency,
			settings,
			market,
			quotes,
			isLoading: isLoading || marketQuery.isLoading,
			convertPrice: (value, baseCurrency = "RUB") =>
				convertCurrencyAmount(value, baseCurrency, selectedCurrency, settings),
			formatPrice: (value, baseCurrency = "RUB") => {
				const converted = convertCurrencyAmount(
					value,
					baseCurrency,
					selectedCurrency,
					settings,
				)

				return formatCurrencyValue(
					converted,
					selectedCurrency,
					CURRENCY_LOCALE[selectedCurrency],
				)
			},
		}
	}, [isLoading, market, marketQuery.isLoading, quotes, selectedCurrency, settings])

	return (
		<CurrencyContext.Provider value={value}>
			{children}
		</CurrencyContext.Provider>
	)
}

export function useCurrency() {
	const context = useContext(CurrencyContext)

	if (!context) {
		throw new Error("useCurrency must be used within CurrencyProvider")
	}

	return context
}
