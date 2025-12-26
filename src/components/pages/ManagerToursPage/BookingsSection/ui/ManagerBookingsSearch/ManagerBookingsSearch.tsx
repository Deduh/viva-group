"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import s from "./ManagerBookingsSearch.module.scss"

interface ManagerBookingsSearchProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function ManagerBookingsSearch({
	value,
	onChange,
	placeholder = "Поиск по ID брони, туру или заметке...",
}: ManagerBookingsSearchProps) {
	return (
		<div className={s.search}>
			<Input
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder={placeholder}
				className={s.searchInput}
			/>
		</div>
	)
}
