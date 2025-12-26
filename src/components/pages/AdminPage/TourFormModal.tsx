"use client"

import { TourForm } from "@/components/forms/TourForm/TourForm"
import { Modal } from "@/components/ui/Modal/Modal"
import type { TourCreateInput, TourUpdateInput } from "@/lib/validation"
import type { Tour } from "@/types"
import s from "./TourModal.module.scss"

interface TourFormModalPropsCreate {
	isOpen: boolean
	onClose: () => void
	tour?: undefined
	onSubmit: (data: TourCreateInput) => Promise<void>
}

interface TourFormModalPropsUpdate {
	isOpen: boolean
	onClose: () => void
	tour: Tour
	onSubmit: (data: TourUpdateInput) => Promise<void>
}

type TourFormModalProps = TourFormModalPropsCreate | TourFormModalPropsUpdate

export function TourFormModal({
	isOpen,
	onClose,
	tour,
	onSubmit,
}: TourFormModalProps) {
	const handleSubmit = async (data: TourCreateInput | TourUpdateInput) => {
		// TypeScript не может проверить union type, но в рантайме все корректно
		// @ts-expect-error - Union type incompatibility between TourCreateInput and TourUpdateInput
		await onSubmit(data)
		onClose()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={tour ? "Редактировать тур" : "Создать тур"}
			size="large"
		>
			<div className={s.body}>
				<TourForm tour={tour} onSubmit={handleSubmit} onCancel={onClose} />
			</div>
		</Modal>
	)
}
