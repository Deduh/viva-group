"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import s from "./ManagerCharterBookingsSearch.module.scss"

interface ManagerCharterBookingsSearchProps {
	value: string
	onChange: (value: string) => void
}

export function ManagerCharterBookingsSearch({
	value,
	onChange,
}: ManagerCharterBookingsSearchProps) {
	return (
		<div className={s.search}>
			<Input
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder="Поиск по ID, маршруту или клиенту"
				className={s.searchInput}
			/>
		</div>
	)
}
