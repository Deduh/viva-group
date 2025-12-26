"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import s from "./ManagerGroupTransportBookingsSearch.module.scss"

interface ManagerGroupTransportBookingsSearchProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function ManagerGroupTransportBookingsSearch({
	value,
	onChange,
	placeholder = "Поиск по ID, маршруту или примечанию...",
}: ManagerGroupTransportBookingsSearchProps) {
	return (
		<div className={s.search}>
			<Input
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder={placeholder}
			/>
		</div>
	)
}
