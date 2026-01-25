"use client"

import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useBookings } from "@/hooks/useBookings"
import { bookingSchema, type BookingInput } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import s from "./BookingForm.module.scss"

interface BookingFormProps {
	tourId: string
	onSuccess?: () => void
	onCancel?: () => void
	onPartySizeChange?: (size: number) => void
	isAvailable?: boolean
}

export function BookingForm({
	tourId,
	onSuccess,
	onCancel,
	onPartySizeChange,
	isAvailable = true,
}: BookingFormProps) {
	const { createBooking } = useBookings()
	const isTourAvailable = isAvailable !== false

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<BookingInput>({
		resolver: zodResolver(bookingSchema),
		defaultValues: {
			tourId,
			participants: [
				{
					fullName: "",
					birthDate: "",
					gender: "male",
					passportNumber: "",
				},
			],
			notes: "",
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: "participants",
	})

	useEffect(() => {
		if (onPartySizeChange) {
			onPartySizeChange(fields.length)
		}
	}, [fields.length, onPartySizeChange])

	const onSubmit = async (data: BookingInput) => {
		if (!isTourAvailable) return

		try {
			await createBooking({
				tourId: data.tourId,
				participants: data.participants,
				notes: data.notes || undefined,
			})

			onSuccess?.()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
			<div className={s.header}>
				<h2 className={s.title}>Забронировать тур</h2>
			</div>

			<div className={s.participants}>
				<div className={s.participantsList}>
					{fields.map((field, index) => (
						<div key={field.id} className={s.participantCard}>
							<div className={s.participantHeader}>
								<span className={s.participantIndex}>Участник {index + 1}</span>

								{fields.length > 1 && (
									<button
										type="button"
										className={s.removeButton}
										onClick={() => remove(index)}
										disabled={isSubmitting}
										title="Удалить участника"
										aria-label="Удалить участника"
									>
										<X className={s.removeButtonIcon} strokeWidth={4} />
									</button>
								)}
							</div>

							<div className={s.participantFields}>
								<Input
									label="ФИО"
									placeholder="Иванов Иван Иванович"
									error={errors.participants?.[index]?.fullName?.message}
									disabled={isSubmitting || !isTourAvailable}
									{...register(`participants.${index}.fullName`)}
								/>

								<div className={s.row}>
									<DateInput
										label="Дата рождения"
										error={errors.participants?.[index]?.birthDate?.message}
										disabled={isSubmitting || !isTourAvailable}
										{...register(`participants.${index}.birthDate`)}
									/>

									<div className={s.selectWrapper}>
										<label className={s.label}>Пол</label>

										<select
											className={s.select}
											disabled={isSubmitting || !isTourAvailable}
											{...register(`participants.${index}.gender`)}
										>
											<option value="male">Мужской</option>
											<option value="female">Женский</option>
										</select>
									</div>
								</div>

								<Input
									label="Номер загранпаспорта"
									placeholder="12 3456789"
									error={errors.participants?.[index]?.passportNumber?.message}
									disabled={isSubmitting || !isTourAvailable}
									{...register(`participants.${index}.passportNumber`)}
								/>
							</div>
						</div>
					))}
				</div>

				<button
					type="button"
					className={s.addButton}
					onClick={() =>
						append({
							fullName: "",
							birthDate: "",
							gender: "male",
							passportNumber: "",
						})
					}
					disabled={isSubmitting || !isTourAvailable}
				>
					<Plus className={s.addButtonIcon} strokeWidth={4} />

					<span>Добавить</span>
				</button>
			</div>

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
