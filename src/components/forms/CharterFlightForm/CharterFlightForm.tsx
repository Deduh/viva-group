"use client"

import { CategorySelect } from "@/components/ui/Form/CategorySelect/CategorySelect"
import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
import { Input } from "@/components/ui/Form/Input/Input"
import { CHARTER_CATEGORIES } from "@/lib/charter-categories"
import { CHARTER_WEEK_DAYS } from "@/lib/charter-week-days"
import {
	charterFlightCreateSchema,
	type CharterFlightCreateInput,
} from "@/lib/validation"
import type { CharterFlight } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import s from "./CharterFlightForm.module.scss"
import { ServiceClassOptions } from "./ui/ServiceClassOptions/ServiceClassOptions"

interface CharterFlightFormProps {
	flight?: CharterFlight
	onSubmit: (data: CharterFlightCreateInput) => Promise<void>
	onCancel?: () => void
}

export function CharterFlightForm({
	flight,
	onSubmit,
	onCancel,
}: CharterFlightFormProps) {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CharterFlightCreateInput>({
		resolver: zodResolver(charterFlightCreateSchema) as never,
		defaultValues: flight
			? {
					from: flight.from,
					to: flight.to,
					dateFrom: flight.dateFrom.split("T")[0] ?? "",
					dateTo: flight.dateTo.split("T")[0] ?? "",
					weekDays: flight.weekDays || [],
					categories: flight.categories || [],
					seatsTotal: flight.seatsTotal,
					hasBusinessClass: flight.hasBusinessClass,
					hasComfortClass: flight.hasComfortClass,
				}
			: {
					from: "",
					to: "",
					dateFrom: "",
					dateTo: "",
					weekDays: [1, 3, 5],
					categories: [],
					seatsTotal: 180,
					hasBusinessClass: false,
					hasComfortClass: false,
				},
	})

	const categories = watch("categories")
	const weekDays = watch("weekDays")
	const selectedCategories = useMemo(() => categories ?? [], [categories])
	const selectedWeekDays = useMemo(() => weekDays ?? [], [weekDays])
	const hasBusinessClassField = register("hasBusinessClass")
	const hasComfortClassField = register("hasComfortClass")

	const toggleWeekDay = (value: number) => {
		const next = selectedWeekDays.includes(value)
			? selectedWeekDays.filter(v => v !== value)
			: [...selectedWeekDays, value]

		next.sort((a, b) => a - b)

		setValue("weekDays", next, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		})
	}

	return (
		<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
			<div className={s.grid}>
				<Input
					label="Откуда"
					type="text"
					placeholder="Москва"
					error={errors.from?.message}
					disabled={isSubmitting}
					required
					{...register("from")}
				/>

				<Input
					label="Куда"
					type="text"
					placeholder="Анталья"
					error={errors.to?.message}
					disabled={isSubmitting}
					required
					{...register("to")}
				/>

				<DateInput
					label="Период: с"
					error={errors.dateFrom?.message}
					disabled={isSubmitting}
					required
					{...register("dateFrom")}
				/>

				<DateInput
					label="Период: по"
					error={errors.dateTo?.message}
					disabled={isSubmitting}
					required
					{...register("dateTo")}
				/>

				<Input
					label="Мест на рейс"
					type="number"
					min={1}
					error={errors.seatsTotal?.message}
					disabled={isSubmitting}
					required
					{...register("seatsTotal", {
						setValueAs: value => Number(value),
					})}
				/>
			</div>

			<div className={s.section}>
				<p className={s.sectionTitle}>Дни вылетов</p>

				<div className={s.chips}>
					{CHARTER_WEEK_DAYS.map(day => {
						const active = selectedWeekDays.includes(day.value)

						return (
							<button
								key={day.value}
								type="button"
								className={s.chip}
								data-active={active}
								onClick={() => toggleWeekDay(day.value)}
								aria-pressed={active}
							>
								{day.label}
							</button>
						)
					})}
				</div>

				{errors.weekDays?.message && (
					<p className={s.error}>{errors.weekDays.message as string}</p>
				)}
			</div>

			<div className={s.section}>
				<CategorySelect
					label="Категории"
					options={CHARTER_CATEGORIES}
					selectedValues={selectedCategories}
					error={errors.categories?.message as string | undefined}
					disabled={isSubmitting}
					onChange={next =>
						setValue("categories", next, {
							shouldDirty: true,
							shouldTouch: true,
							shouldValidate: true,
						})
					}
				/>
			</div>

			<div className={s.section}>
				<ServiceClassOptions
					businessField={hasBusinessClassField}
					comfortField={hasComfortClassField}
					disabled={isSubmitting}
				/>
			</div>

			<div className={s.actions}>
				{onCancel && (
					<button
						type="button"
						className={s.secondary}
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Отмена
					</button>
				)}

				<button type="submit" className={s.primary} disabled={isSubmitting}>
					{isSubmitting
						? "Сохраняем..."
						: flight
							? "Сохранить рейс"
							: "Создать рейс"}
				</button>
			</div>
		</form>
	)
}
