"use client"

import { Modal } from "@/components/ui/Modal/Modal"
import type { Tour } from "@/types"
import s from "./TourModal.module.scss"

interface TourDeleteConfirmProps {
	isOpen: boolean
	onClose: () => void
	tour: Tour | null
	onConfirm: () => void
	isDeleting?: boolean
}

export function TourDeleteConfirm({
	isOpen,
	onClose,
	tour,
	onConfirm,
	isDeleting = false,
}: TourDeleteConfirmProps) {
	if (!tour) return null

	const handleConfirm = () => {
		onConfirm()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Подтверждение удаления"
			size="small"
		>
			<div className={s.deleteBody}>
				<p className={s.deleteText}>
					Вы уверены, что хотите удалить тур <strong>{tour.destination}</strong>
					?
				</p>
				<p className={s.deleteHint}>Это действие нельзя отменить.</p>
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
						onClick={handleConfirm}
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
