"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useBookings } from "@/hooks/useBookings"
import { bookingSchema, type BookingInput } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import s from "./BookingForm.module.scss"

interface BookingFormProps {
	tourId: string
	tourName?: string
	onSuccess?: () => void
	onCancel?: () => void
	onPartySizeChange?: (size: number) => void
	isAvailable?: boolean
}

export function BookingForm({
	tourId,
	tourName,
	onSuccess,
	onCancel,
	onPartySizeChange,
	isAvailable = true,
}: BookingFormProps) {
	const { createBooking } = useBookings()
	const isTourAvailable = isAvailable !== false

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<BookingInput>({
		resolver: zodResolver(bookingSchema),
		defaultValues: {
			tourId,
			partySize: 1,
			startDate: "",
			notes: "",
		},
	})

	const partySize = watch("partySize")

	useEffect(() => {
		if (onPartySizeChange && partySize) {
			onPartySizeChange(partySize)
		}
	}, [partySize, onPartySizeChange])

	const onSubmit = async (data: BookingInput) => {
		if (!isTourAvailable) return

		try {
			await createBooking({
				tourId: data.tourId,
				partySize: data.partySize,
				startDate: data.startDate,
				notes: data.notes || undefined,
			})

			onSuccess?.()
		} catch (error) {
			// Ошибка уже обработана в useBookings
			console.error(error)
		}
	}

	return (
		<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
			<div className={s.header}>
				<h2 className={s.title}>Забронировать тур</h2>
				{tourName && <p className={s.subtitle}>{tourName}</p>}
			</div>

			<Input
				label="Количество человек"
				type="number"
				min={1}
				max={20}
				placeholder="1"
				error={errors.partySize?.message}
				disabled={isSubmitting || !isTourAvailable}
				{...register("partySize", { valueAsNumber: true })}
			/>

			<Input
				label="Дата начала тура"
				type="date"
				error={errors.startDate?.message}
				disabled={isSubmitting || !isTourAvailable}
				{...register("startDate")}
			/>

			<TextArea
				label="Заметки (опционально)"
				placeholder="Укажите особые пожелания или требования..."
				rows={4}
				maxLength={500}
				showCharCount
				error={errors.notes?.message}
				disabled={isSubmitting || !isTourAvailable}
				{...register("notes")}
			/>

			<div className={s.actions}>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
						className={s.cancelButton}
					>
						Отмена
					</button>
				)}
				{isTourAvailable ? (
					<button
						type="submit"
						disabled={isSubmitting}
						className={s.submitButton}
					>
						{isSubmitting ? (
							<>
								<LoadingSpinner size="small" />
								<span>Бронируем...</span>
							</>
						) : (
							"Забронировать"
						)}
					</button>
				) : (
					<p className={s.unavailableNote}>
						Тур временно недоступен для бронирования.
					</p>
				)}
			</div>
		</form>
	)
}
