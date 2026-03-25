"use client"

import { useCurrency } from "@/context/CurrencyContext"
import s from "./PriceCalculation.module.scss"

interface PriceCalculationProps {
	partySize: number
	pricePerPerson: number
	baseCurrency?: "RUB" | "USD" | "EUR" | "CNY"
}

export function PriceCalculation({
	partySize,
	pricePerPerson,
	baseCurrency = "RUB",
}: PriceCalculationProps) {
	const { formatPrice } = useCurrency()
	const totalPrice = pricePerPerson * partySize

	return (
		<div className={s.priceCalculation}>
			<div className={s.calculationRow}>
				<span className={s.calculationLabel}>Количество человек:</span>
				<span className={s.calculationValue}>{partySize}</span>
			</div>
			<div className={s.calculationRow}>
				<span className={s.calculationLabel}>Цена за человека:</span>
				<span className={s.calculationValue}>
					{formatPrice(pricePerPerson, baseCurrency)}
				</span>
			</div>
			<div className={s.calculationDivider} />
			<div className={s.calculationRow}>
				<span className={s.calculationTotalLabel}>Итого:</span>
				<span className={s.calculationTotalValue}>
					{formatPrice(totalPrice, baseCurrency)}
				</span>
			</div>
		</div>
	)
}
