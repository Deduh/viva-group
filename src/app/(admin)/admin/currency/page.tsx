"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import {
	CBR_DAILY_RATES_URL,
	DEFAULT_CURRENCY_MARKET_SNAPSHOT,
	DEFAULT_CURRENCY_SETTINGS,
	fetchCbrCurrencyMarketSnapshot,
	mergeCurrencySettingsWithMarket,
	SUPPORTED_CURRENCIES,
} from "@/lib/currency"
import { CurrencySettings } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type FocusEvent, useEffect, useMemo, useState } from "react"
import s from "./page.module.scss"

export default function AdminCurrencyPage() {
	const { user, isLoading, requireRole } = useAuth()
	const { showSuccess, showError } = useToast()
	const queryClient = useQueryClient()
	const [formState, setFormState] = useState<CurrencySettings>(
		DEFAULT_CURRENCY_SETTINGS,
	)

	useEffect(() => {
		requireRole("ADMIN")
	}, [requireRole])

	const settingsQuery = useQuery({
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

	useEffect(() => {
		if (settingsQuery.data) {
			setFormState({
				baseCurrency: settingsQuery.data.baseCurrency ?? "RUB",
				rates: SUPPORTED_CURRENCIES.map(currency => {
					const existing = settingsQuery.data.rates.find(
						rate => rate.currency === currency,
					)
					const fallback = DEFAULT_CURRENCY_SETTINGS.rates.find(
						rate => rate.currency === currency,
					)

					return (
						existing ?? fallback ?? { currency, rate: 1, markupPercent: 0 }
					)
				}),
				updatedAt: settingsQuery.data.updatedAt,
			})
		}
	}, [settingsQuery.data])

	const saveMutation = useMutation({
		mutationFn: () =>
			api.updateCurrencySettings({
				baseCurrency: formState.baseCurrency,
				rates: formState.rates,
			}),
		onSuccess: data => {
			queryClient.setQueryData(["currencySettings"], data)
			showSuccess("Настройки валют сохранены")
		},
		onError: error => {
			showError(error instanceof Error ? error.message : "Не удалось сохранить")
		},
	})

	const market = marketQuery.data ?? DEFAULT_CURRENCY_MARKET_SNAPSHOT

	const updateMarkup = (currency: (typeof SUPPORTED_CURRENCIES)[number], value: number) => {
		setFormState(prev => {
			const existing = prev.rates.find(rate => rate.currency === currency)

			if (!existing) {
				return {
					...prev,
					rates: [
						...prev.rates,
						{
							currency,
							rate:
								market.rates.find(rate => rate.currency === currency)?.rate ?? 1,
							markupPercent: value,
						},
					],
				}
			}

			return {
				...prev,
				rates: prev.rates.map(item =>
					item.currency === currency ? { ...item, markupPercent: value } : item,
				),
			}
		})
	}

	const handleMarkupFocus = (event: FocusEvent<HTMLInputElement>) => {
		requestAnimationFrame(() => {
			event.target.select()
		})
	}

	const rateMap = useMemo(() => {
		const merged = mergeCurrencySettingsWithMarket(formState, market)

		return new Map(merged.rates.map(rate => [rate.currency, rate]))
	}, [formState, market])

	if (isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user) return null

	return (
		<div className={s.shell}>
			<div className={s.header}>
				<h1 className={s.title}>Курсы валют и наценки</h1>
				<p className={s.text}>
					Курс подтягивается автоматически из ЦБ РФ. Вручную настраивается только
					наценка, которая применяется на сайте после конвертации.
				</p>
				<p className={s.meta}>
					Источник: <a href={CBR_DAILY_RATES_URL}>cbr-xml-daily.ru</a>
				</p>
			</div>

			<div className={s.grid}>
				{SUPPORTED_CURRENCIES.map(currency => {
					const rate = rateMap.get(currency) ?? {
						currency,
						rate: currency === "RUB" ? 1 : 1,
						markupPercent: 0,
					}

					return (
						<div key={currency} className={s.card}>
							<h2 className={s.cardTitle}>{currency}</h2>

							<div className={s.fields}>
								<Input
									label="Курс к RUB"
									type="number"
									step="0.0001"
									value={rate.rate}
									disabled
									helperText={
										currency === "RUB"
											? "Базовая валюта сайта"
											: "Автоматически обновляется из API ЦБ РФ"
									}
								/>

								<Input
									label="Наценка, %"
									type="number"
									step="0.1"
									value={rate.markupPercent}
									onFocus={handleMarkupFocus}
									onChange={event => {
										const value = Number(event.target.value) || 0
										updateMarkup(currency, value)
									}}
								/>
							</div>
						</div>
					)
				})}
			</div>

			<button
				type="button"
				className={s.saveButton}
				onClick={() => saveMutation.mutate()}
				disabled={saveMutation.isPending}
			>
				{saveMutation.isPending ? "Сохраняем..." : "Сохранить настройки"}
			</button>
		</div>
	)
}
