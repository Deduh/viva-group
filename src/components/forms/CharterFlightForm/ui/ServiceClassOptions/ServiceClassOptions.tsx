"use client"

import { CheckboxPill } from "@/components/ui/Form/CheckboxPill/CheckboxPill"
import type { UseFormRegisterReturn } from "react-hook-form"
import s from "./ServiceClassOptions.module.scss"

interface ServiceClassOptionsProps {
	businessField: UseFormRegisterReturn
	comfortField: UseFormRegisterReturn
	disabled?: boolean
}

export function ServiceClassOptions({
	businessField,
	comfortField,
	disabled = false,
}: ServiceClassOptionsProps) {
	return (
		<div className={s.root}>
			<p className={s.title}>Классы обслуживания</p>

			<div className={s.options}>
				<CheckboxPill
					label="Бизнес-класс"
					field={businessField}
					disabled={disabled}
				/>

				<CheckboxPill
					label="Комфорт-класс"
					field={comfortField}
					disabled={disabled}
				/>
			</div>
		</div>
	)
}
