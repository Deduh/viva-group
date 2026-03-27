"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { buildCurrencyQuotes } from "@/lib/currency"
import { formatDate } from "@/lib/format"
import s from "./CurrencyTicker.module.scss"

export function CurrencyTicker() {
	const { market, quotes, settings } = useCurrency()
	const updatedAt = market.updatedAt
	const resolvedQuotes =
		quotes.some(quote => quote.id === "EUR") ? quotes : buildCurrencyQuotes(settings)

	return (
		<div className={s.ticker}>
			<div className={s.track}>
				{resolvedQuotes.map(quote => (
					<div key={quote.id} className={s.item}>
						<span className={s.code}>
							{quote.label}
							<span className={s.symbol}>{quote.symbol}</span>
						</span>

						<span className={s.value}>
							{quote.value.toFixed(4)}
						</span>
					</div>
				))}
			</div>

			<div className={s.meta}>
				Курс на сегодняшний день, обновлено {formatDate(updatedAt)}
			</div>
		</div>
	)
}
