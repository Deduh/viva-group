"use client"

import type { UseFormRegisterReturn } from "react-hook-form"
import s from "./CheckboxPill.module.scss"

interface CheckboxPillProps {
	label: string
	field: UseFormRegisterReturn
	disabled?: boolean
}

export function CheckboxPill({
	label,
	field,
	disabled = false,
}: CheckboxPillProps) {
	return (
		<label className={s.option}>
			<input
				type="checkbox"
				className={s.input}
				disabled={disabled}
				{...field}
			/>

			<span className={s.control} aria-hidden="true">
				<span className={s.check} />
			</span>

			<span className={s.text}>{label}</span>
		</label>
	)
}
