"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { formatDate } from "@/lib/format"
import s from "./CurrencyTicker.module.scss"

export function CurrencyTicker() {
	const { market, quotes } = useCurrency()
	const updatedAt = market.updatedAt

	return (
		<div className={s.ticker}>
			<div className={s.track}>
				{quotes.map(quote => (
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
				Курсы ЦБ РФ, обновлено {formatDate(updatedAt)}
			</div>
		</div>
	)
}
