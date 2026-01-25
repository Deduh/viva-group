"use client"

import { formatDate } from "@/lib/format"
import type { User } from "@/types"
import { Smartphone, User2 } from "lucide-react"
import s from "./ManagerCard.module.scss"

interface ManagerCardProps {
	manager: User
	onEdit: () => void
	onDelete: () => void
}

export function ManagerCard({ manager, onEdit, onDelete }: ManagerCardProps) {
	const isBlocked = manager.status === "blocked"

	return (
		<div className={s.card}>
			<div className={s.header}>
				<div className={s.avatar}>{manager.name?.charAt(0) || "M"}</div>

				<div>
					<h3 className={s.name}>{manager.name || manager.email}</h3>

					<p className={s.email}>{manager.email}</p>
				</div>

				<div
					className={s.status}
					data-variant={isBlocked ? "blocked" : "active"}
				>
					<span className={s.statusDot} />

					{isBlocked ? "Заблокирован" : "Активен"}
				</div>
			</div>

			<div className={s.meta}>
				<div className={s.metaItem}>
					<User2 size={"1.6rem"} />

					<span>{manager.role === "ADMIN" ? "Администратор" : "Менеджер"}</span>
				</div>

				{manager.phone && (
					<div className={s.metaItem}>
						<Smartphone size={"1.6rem"} />

						<span>{manager.phone}</span>
					</div>
				)}

				{manager.lastLoginAt && (
					<div className={s.metaItem}>
						<span>Последний вход: {formatDate(manager.lastLoginAt)}</span>
					</div>
				)}
			</div>

			<div className={s.actions}>
				<button type="button" className={s.secondary} onClick={onEdit}>
					Редактировать
				</button>

				<button type="button" className={s.danger} onClick={onDelete}>
					Удалить
				</button>
			</div>
		</div>
	)
}
