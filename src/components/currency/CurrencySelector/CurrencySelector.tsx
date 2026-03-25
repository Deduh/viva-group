"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { CURRENCY_LABEL, SUPPORTED_CURRENCIES } from "@/lib/currency"
import s from "./CurrencySelector.module.scss"

interface CurrencySelectorProps {
	compact?: boolean
}

export function CurrencySelector({
	compact = false,
}: CurrencySelectorProps) {
	const { selectedCurrency, setSelectedCurrency } = useCurrency()

	return (
		<label className={`${s.wrapper} ${compact ? s.compact : ""}`}>
			<span className={s.label}>Валюта</span>

			<select
				value={selectedCurrency}
				onChange={event =>
					setSelectedCurrency(event.target.value as (typeof SUPPORTED_CURRENCIES)[number])
				}
				className={s.select}
			>
				{SUPPORTED_CURRENCIES.map(currency => (
					<option key={currency} value={currency}>
						{CURRENCY_LABEL[currency]}
					</option>
				))}
			</select>
		</label>
	)
}
