"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Input } from "@/components/ui/Form/Input/Input"
import type { User } from "@/types"
import { ManagerCard } from "./ui/ManagerCard"
import s from "./ManagersSection.module.scss"

interface ManagersSectionProps {
	managers: User[]
	isLoading: boolean
	search: string
	onSearchChange: (value: string) => void
	onCreate: () => void
	onEdit: (manager: User) => void
	onDelete: (manager: User) => void
}

export function ManagersSection({
	managers,
	isLoading,
	search,
	onSearchChange,
	onCreate,
	onEdit,
	onDelete,
}: ManagersSectionProps) {
	return (
		<section className={s.section}>
			<div className={s.topRow}>
				<div>
					<h2 className={s.title}>Менеджеры</h2>
					<p className={s.subtitle}>
						Управляйте доступом менеджеров, статусами и ролями
					</p>

					<div className={s.searchWrapper}>
						<Input
							value={search}
							onChange={e => onSearchChange(e.target.value)}
							placeholder="Поиск по имени, email или телефону"
							className={s.search}
						/>
					</div>
				</div>

				<div className={s.actions}>
					<button type="button" className={s.primary} onClick={onCreate}>
						Добавить менеджера
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка менеджеров..." />
				</div>
			) : managers.length === 0 ? (
				<div className={s.empty}>Менеджеры не найдены</div>
			) : (
				<div className={s.grid}>
					{managers.map(manager => (
						<ManagerCard
							key={manager.id}
							manager={manager}
							onEdit={() => onEdit(manager)}
							onDelete={() => onDelete(manager)}
						/>
					))}
				</div>
			)}
		</section>
	)
}
