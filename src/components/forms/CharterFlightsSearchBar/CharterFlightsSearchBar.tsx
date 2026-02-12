"use client"

import { CategorySelect } from "@/components/ui/Form/CategorySelect/CategorySelect"
import { CheckboxPill } from "@/components/ui/Form/CheckboxPill/CheckboxPill"
import { CitySelect } from "@/components/ui/Form/CitySelect/CitySelect"
import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
import { Input } from "@/components/ui/Form/Input/Input"
import { CHARTER_CATEGORIES } from "@/lib/charter-categories"
import {
	charterFlightsSearchSchema,
	type CharterFlightsSearchInput,
} from "@/lib/validation"
import type { CharterFlight } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, MapPin, Search, Tags, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import s from "./CharterFlightsSearchBar.module.scss"

interface CharterFlightsSearchBarProps {
	flights: CharterFlight[]
	flightsLoading?: boolean
	flightsError?: string
	submitLabel?: string
	submitDisabled?: boolean
	defaultValues?: Partial<CharterFlightsSearchInput>
	onSubmit: (values: CharterFlightsSearchInput) => void | Promise<void>
}

const extractFirstError = (errs: unknown): string | null => {
	if (!errs || typeof errs !== "object") return null

	const obj = errs as Record<string, unknown>

	if (typeof obj.message === "string") return obj.message

	for (const value of Object.values(obj)) {
		const msg = extractFirstError(value)

		if (msg) return msg
	}

	return null
}

export function CharterFlightsSearchBar({
	flights,
	flightsLoading = false,
	flightsError,
	submitLabel = "Забронировать",
	submitDisabled = false,
	defaultValues,
	onSubmit,
}: CharterFlightsSearchBarProps) {
	const [formError, setFormError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState,
		setError,
		clearErrors,
	} = useForm<CharterFlightsSearchInput>({
		resolver: zodResolver(charterFlightsSearchSchema) as never,
		defaultValues: {
			from: "",
			to: "",
			dateFrom: "",
			dateTo: "",
			adults: 1,
			children: 0,
			categories: [],
			hasSeats: true,
			hasBusinessClass: false,
			hasComfortClass: false,
			...defaultValues,
		},
	})

	const fromValue = watch("from") || ""
	const toValue = watch("to") || ""
	const dateFromValue = watch("dateFrom") || ""
	const dateToValue = watch("dateTo") || ""
	const categoriesValue = watch("categories") || []

	useEffect(() => {
		register("from")
		register("to")
		register("categories")
	}, [register])

	useEffect(() => {
		if (typeof window === "undefined") return

		const mql = window.matchMedia("(max-width: 768px)")

		const applyMobile = (isMobile: boolean) => {
			if (!isMobile) return

			setValue("categories", [], { shouldDirty: false, shouldTouch: false })
			setValue("hasSeats", false, { shouldDirty: false, shouldTouch: false })
			setValue("hasBusinessClass", false, {
				shouldDirty: false,
				shouldTouch: false,
			})
			setValue("hasComfortClass", false, {
				shouldDirty: false,
				shouldTouch: false,
			})
			clearErrors("categories")
		}

		applyMobile(mql.matches)

		const onChange = (e: MediaQueryListEvent) => applyMobile(e.matches)
		mql.addEventListener("change", onChange)

		return () => mql.removeEventListener("change", onChange)
	}, [clearErrors, setValue])

	const normalize = (v: string) => v.trim()

	const resolveAllowed = (value: string, allowed: readonly string[]) => {
		const v = normalize(value).toLowerCase()

		if (!v) return null

		return allowed.find(opt => opt.toLowerCase() === v) ?? null
	}

	const allFromCities = useMemo(() => {
		return Array.from(new Set(flights.map(f => f.from))).sort((a, b) =>
			a.localeCompare(b, "ru"),
		)
	}, [flights])

	const allToCities = useMemo(() => {
		return Array.from(new Set(flights.map(f => f.to))).sort((a, b) =>
			a.localeCompare(b, "ru"),
		)
	}, [flights])

	const fromIsExact = useMemo(() => {
		return allFromCities.includes(fromValue)
	}, [allFromCities, fromValue])

	const toIsExact = useMemo(() => {
		return allToCities.includes(toValue)
	}, [allToCities, toValue])

	const toOptions = useMemo(() => {
		if (fromIsExact) {
			return Array.from(
				new Set(flights.filter(f => f.from === fromValue).map(f => f.to)),
			).sort((a, b) => a.localeCompare(b, "ru"))
		}

		return allToCities
	}, [allToCities, flights, fromIsExact, fromValue])

	const fromOptions = useMemo(() => {
		if (toIsExact) {
			return Array.from(
				new Set(flights.filter(f => f.to === toValue).map(f => f.from)),
			).sort((a, b) => a.localeCompare(b, "ru"))
		}

		return allFromCities
	}, [allFromCities, flights, toIsExact, toValue])

	useEffect(() => {
		if (!fromIsExact) return
		if (!toValue) return

		const allowed = new Set(toOptions)

		if (!allowed.has(toValue)) {
			setValue("to", "", { shouldDirty: true, shouldTouch: true })
			clearErrors("to")
		}
	}, [clearErrors, fromIsExact, setValue, toOptions, toValue])

	useEffect(() => {
		if (!toIsExact) return
		if (!fromValue) return

		const allowed = new Set(fromOptions)

		if (!allowed.has(fromValue)) {
			setValue("from", "", { shouldDirty: true, shouldTouch: true })
			clearErrors("from")
		}
	}, [clearErrors, fromOptions, fromIsExact, fromValue, setValue, toIsExact])

	const matchingFlights = useMemo(() => {
		if (!fromIsExact || !toIsExact) return []

		return flights.filter(f => f.from === fromValue && f.to === toValue)
	}, [flights, fromIsExact, fromValue, toIsExact, toValue])

	const routeMinDate = useMemo(() => {
		if (matchingFlights.length === 0) return null

		const min = matchingFlights
			.map(f => f.dateFrom.slice(0, 10))
			.reduce((acc, v) => (v < acc ? v : acc))

		return min
	}, [matchingFlights])

	const routeMaxDate = useMemo(() => {
		if (matchingFlights.length === 0) return null

		const max = matchingFlights
			.map(f => f.dateTo.slice(0, 10))
			.reduce((acc, v) => (v > acc ? v : acc))

		return max
	}, [matchingFlights])

	const routeWeekDaysNumbers = useMemo(() => {
		if (matchingFlights.length === 0) return null

		const set = new Set<number>()

		for (const f of matchingFlights) {
			for (const d of f.weekDays) set.add(d)
		}

		return Array.from(set).sort((a, b) => a - b)
	}, [matchingFlights])

	const isoWeekdayFromDateOnly = (dateOnly: string) => {
		const [year, month, day] = dateOnly.split("-").map(Number)

		if (!year || !month || !day) return null

		const dt = new Date(Date.UTC(year, month - 1, day))

		if (Number.isNaN(dt.getTime())) return null

		return ((dt.getUTCDay() + 6) % 7) + 1
	}

	const isDateAllowedBySchedule = (dateOnly: string) => {
		if (!routeWeekDaysNumbers || routeWeekDaysNumbers.length === 0) return true

		const wd = isoWeekdayFromDateOnly(dateOnly)

		if (wd === null) return true

		return routeWeekDaysNumbers.includes(wd)
	}

	const isDateAllowedByRange = (dateOnly: string) => {
		if (!routeMinDate || !routeMaxDate) return true

		return dateOnly >= routeMinDate && dateOnly <= routeMaxDate
	}

	useEffect(() => {
		if (!routeMinDate || !routeMaxDate) return

		if (
			dateFromValue &&
			(dateFromValue < routeMinDate || dateFromValue > routeMaxDate)
		) {
			setValue("dateFrom", "", { shouldDirty: true, shouldTouch: true })
			clearErrors("dateFrom")
		}

		if (
			dateToValue &&
			(dateToValue < routeMinDate || dateToValue > routeMaxDate)
		) {
			setValue("dateTo", "", { shouldDirty: true, shouldTouch: true })
			clearErrors("dateTo")
		}
	}, [
		clearErrors,
		dateFromValue,
		dateToValue,
		routeMaxDate,
		routeMinDate,
		setValue,
	])

	const onValidSubmit = async (values: CharterFlightsSearchInput) => {
		setFormError(null)

		const fromMatch = resolveAllowed(values.from, fromOptions)

		if (!fromMatch) {
			setError("from", { type: "manual", message: "Выберите город из списка" })
			setValue("from", "", { shouldDirty: true, shouldTouch: true })

			return
		}

		const toMatch = resolveAllowed(values.to, toOptions)
		if (!toMatch) {
			setError("to", { type: "manual", message: "Выберите город из списка" })
			setValue("to", "", { shouldDirty: true, shouldTouch: true })

			return
		}

		if (
			!isDateAllowedByRange(values.dateFrom) ||
			!isDateAllowedBySchedule(values.dateFrom)
		) {
			setError("dateFrom", {
				type: "manual",
				message: "Дата вылета недоступна по расписанию",
			})

			return
		}

		if (
			!isDateAllowedByRange(values.dateTo) ||
			!isDateAllowedBySchedule(values.dateTo)
		) {
			setError("dateTo", {
				type: "manual",
				message: "Дата возврата недоступна по расписанию",
			})

			return
		}

		await onSubmit({
			...values,
			from: fromMatch,
			to: toMatch,
			children: typeof values.children === "number" ? values.children : 0,
		})
	}

	return (
		<div className={s.shell}>
			<form
				className={s.bar}
				onSubmit={handleSubmit(onValidSubmit, invalid => {
					setFormError(extractFirstError(invalid) || "Проверьте поля формы")
				})}
			>
				<div className={s.wrapper}>
					<div className={s.fields}>
						<div className={s.field}>
							<div className={s.icon}>
								<MapPin size={"2rem"} />
							</div>

							<div className={s.fieldBody}>
								<CitySelect
									label="Откуда"
									placeholder="Например: Улан-Удэ"
									options={fromOptions}
									value={fromValue}
									error={formState.errors.from?.message as string | undefined}
									disabled={formState.isSubmitting || flightsLoading}
									onChange={next => {
										setFormError(null)
										setValue("from", next, {
											shouldDirty: true,
											shouldTouch: true,
										})
										clearErrors("from")
									}}
									onBlur={() => {
										if (!fromValue.trim()) return
										const match = resolveAllowed(fromValue, fromOptions)
										if (!match) {
											setValue("from", "", {
												shouldDirty: true,
												shouldTouch: true,
											})
											setError("from", {
												type: "manual",
												message: "Выберите город из списка",
											})
											return
										}
										setValue("from", match, {
											shouldDirty: true,
											shouldTouch: true,
										})
										clearErrors("from")
									}}
								/>
							</div>
						</div>

						<div className={s.field}>
							<div className={s.icon}>
								<MapPin size={"2rem"} />
							</div>

							<div className={s.fieldBody}>
								<CitySelect
									label="Куда"
									placeholder="Например: Пекин"
									options={toOptions}
									value={toValue}
									error={formState.errors.to?.message as string | undefined}
									disabled={formState.isSubmitting || flightsLoading}
									onChange={next => {
										setFormError(null)
										setValue("to", next, {
											shouldDirty: true,
											shouldTouch: true,
										})
										clearErrors("to")
									}}
									onBlur={() => {
										if (!toValue.trim()) return
										const match = resolveAllowed(toValue, toOptions)
										if (!match) {
											setValue("to", "", {
												shouldDirty: true,
												shouldTouch: true,
											})
											setError("to", {
												type: "manual",
												message: "Выберите город из списка",
											})
											return
										}
										setValue("to", match, {
											shouldDirty: true,
											shouldTouch: true,
										})
										clearErrors("to")
									}}
								/>
							</div>
						</div>
					</div>

					<div className={s.fieldsWrapper}>
						<div className={s.fields}>
							<div className={s.field}>
								<div className={`${s.icon} ${s.purple}`}>
									<Calendar size={"2rem"} />
								</div>

								<div className={s.fieldBody}>
									<DateInput
										label="Вылет"
										error={
											formState.errors.dateFrom?.message as string | undefined
										}
										min={routeMinDate || undefined}
										max={routeMaxDate || undefined}
										allowedWeekDays={routeWeekDaysNumbers || undefined}
										{...register("dateFrom", {
											onChange: () => setFormError(null),
										})}
									/>
								</div>
							</div>

							<div className={s.field}>
								<div className={`${s.icon} ${s.purple}`}>
									<Calendar size={"2rem"} />
								</div>

								<div className={s.fieldBody}>
									<DateInput
										label="Возврат"
										error={
											formState.errors.dateTo?.message as string | undefined
										}
										min={routeMinDate || undefined}
										max={routeMaxDate || undefined}
										allowedWeekDays={routeWeekDaysNumbers || undefined}
										{...register("dateTo", {
											onChange: () => setFormError(null),
										})}
									/>
								</div>
							</div>
						</div>

						<div className={`${s.fields} ${s.fieldsTwoColMobile}`}>
							<div className={s.field}>
								<div className={s.icon}>
									<Users size={"2rem"} />
								</div>

								<div className={s.fieldBody}>
									<Input
										label="Взрослых"
										type="number"
										min={1}
										error={
											formState.errors.adults?.message as string | undefined
										}
										{...register("adults", {
											setValueAs: v => (v === "" ? undefined : Number(v)),
											onChange: () => setFormError(null),
										})}
									/>
								</div>
							</div>

							<div className={s.field}>
								<div className={s.icon}>
									<Users size={"2rem"} />
								</div>

								<div className={s.fieldBody}>
									<Input
										label="Детей"
										type="number"
										min={0}
										error={
											formState.errors.children?.message as string | undefined
										}
										{...register("children", {
											setValueAs: v => (v === "" ? 0 : Number(v)),
											onChange: () => setFormError(null),
										})}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className={`${s.field} ${s.desktopOnly}`}>
						<div className={s.icon}>
							<Tags size={"2rem"} />
						</div>

						<div className={s.fieldBody}>
							<CategorySelect
								label="Категории"
								placeholder="Выберите категории"
								options={CHARTER_CATEGORIES}
								selectedValues={categoriesValue}
								disabled={formState.isSubmitting}
								error={
									formState.errors.categories?.message as string | undefined
								}
								onChange={next =>
									setValue("categories", next, {
										shouldDirty: true,
										shouldTouch: true,
									})
								}
							/>
						</div>
					</div>

					<div className={`${s.field} ${s.desktopOnly}`}>
						<div className={s.icon}>
							<Search size={"2rem"} />
						</div>

						<div className={s.fieldBody}>
							<div className={s.filtersBlock}>
								<div className={s.filtersLabel}>Пожелания</div>

								<div className={s.filters}>
									<CheckboxPill
										label="Есть места"
										field={register("hasSeats")}
									/>

									<CheckboxPill
										label="Бизнес-класс"
										field={register("hasBusinessClass")}
									/>

									<CheckboxPill
										label="Комфорт-класс"
										field={register("hasComfortClass")}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<button
					className={s.button}
					type="submit"
					disabled={
						submitDisabled ||
						formState.isSubmitting ||
						flightsLoading ||
						!!flightsError
					}
				>
					<div className={s.buttonText}>{submitLabel}</div>

					<div className={s.buttonIcon}>
						<Search size={"1.6rem"} />
					</div>
				</button>
			</form>

			{formError && <div className={s.error}>{formError}</div>}

			{/* {flightsError && <div className={s.error}>{flightsError}</div>} */}
		</div>
	)
}
