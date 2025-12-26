"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Modal } from "@/components/ui/Modal/Modal"
import s from "./CancelBookingModal.module.scss"

interface CancelBookingModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	bookingId: string | number
	isPending: boolean
}

export function CancelBookingModal({
	isOpen,
	onClose,
	onConfirm,
	bookingId,
	isPending,
}: CancelBookingModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Подтвердите отмену">
			<div className={s.content}>
				<p>Вы уверены, что хотите отменить бронирование #{bookingId}?</p>
				<p className={s.warning}>
					Это действие необратимо. После отмены вы не сможете восстановить
					бронирование.
				</p>
				<div className={s.actions}>
					<button
						type="button"
						className={s.cancelButton}
						onClick={onClose}
						disabled={isPending}
					>
						Нет, оставить
					</button>
					<button
						type="button"
						className={s.confirmButton}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<LoadingSpinner size="small" />
								<span>Отменяем...</span>
							</>
						) : (
							"Да, отменить"
						)}
					</button>
				</div>
			</div>
		</Modal>
	)
}
