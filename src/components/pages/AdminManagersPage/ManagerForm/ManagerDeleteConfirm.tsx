"use client"

import { Modal } from "@/components/ui/Modal/Modal"
import s from "../../AdminPage/TourModal.module.scss"

interface ManagerDeleteConfirmProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	managerName?: string
	isDeleting?: boolean
}

export function ManagerDeleteConfirm({
	isOpen,
	onClose,
	onConfirm,
	managerName,
	isDeleting = false,
}: ManagerDeleteConfirmProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Удалить менеджера?"
			size="small"
		>
			<div className={s.deleteBody}>
				<p className={s.deleteText}>{managerName || "Пользователь"}</p>
				<p className={s.deleteHint}>
					Действие необратимо. Менеджер потеряет доступ.
				</p>
				<div className={s.deleteActions}>
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						className={s.secondary}
					>
						Отмена
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						className={s.danger}
					>
						{isDeleting ? "Удаляем..." : "Удалить"}
					</button>
				</div>
			</div>
		</Modal>
	)
}
