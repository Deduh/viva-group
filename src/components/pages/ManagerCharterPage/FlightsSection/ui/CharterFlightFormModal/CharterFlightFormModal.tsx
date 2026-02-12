"use client"

import { CharterFlightForm } from "@/components/forms/CharterFlightForm/CharterFlightForm"
import { Modal } from "@/components/ui/Modal/Modal"
import type { CharterFlightCreateInput } from "@/lib/validation"
import type { CharterFlight } from "@/types"

interface CharterFlightFormModalProps {
	isOpen: boolean
	onClose: () => void
	flight?: CharterFlight | null
	onSubmit: (data: CharterFlightCreateInput) => Promise<void>
}

export function CharterFlightFormModal({
	isOpen,
	onClose,
	flight,
	onSubmit,
}: CharterFlightFormModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={flight ? `Редактировать ${flight.publicId}` : "Создать рейс"}
			size="large"
		>
			<CharterFlightForm
				flight={flight ?? undefined}
				onSubmit={onSubmit}
				onCancel={onClose}
			/>
		</Modal>
	)
}
