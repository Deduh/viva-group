"use client"

import { formatCurrency } from "@/lib/format"
import s from "./PriceCalculation.module.scss"

interface PriceCalculationProps {
	partySize: number
	pricePerPerson: number
}

export function PriceCalculation({
	partySize,
	pricePerPerson,
}: PriceCalculationProps) {
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
					{formatCurrency(pricePerPerson)}
				</span>
			</div>
			<div className={s.calculationDivider} />
			<div className={s.calculationRow}>
				<span className={s.calculationTotalLabel}>Итого:</span>
				<span className={s.calculationTotalValue}>
					{formatCurrency(totalPrice)}
				</span>
			</div>
		</div>
	)
}

