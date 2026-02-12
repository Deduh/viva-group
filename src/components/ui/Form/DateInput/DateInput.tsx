import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import {
	forwardRef,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
	type FocusEvent,
	type InputHTMLAttributes,
} from "react"
import { FormError } from "../FormError/FormError"
import s from "./DateInput.module.scss"

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
	label?: string
	error?: string
	helperText?: string
	allowedWeekDays?: number[] // 1..7 (Mon..Sun)
}

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const monthNames = Array.from({ length: 12 }, (_, index) =>
	new Date(2024, index, 1).toLocaleDateString("ru-RU", { month: "long" }),
)

const parseIsoDate = (value: string | undefined) => {
	if (!value) return null

	const [year, month, day] = value.split("-").map(Number)

	if (!year || !month || !day) return null

	return new Date(year, month - 1, day)
}

const formatIsoDate = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}

const isoWeekdayFromDateOnly = (dateOnly: string) => {
	const [year, month, day] = dateOnly.split("-").map(Number)
	if (!year || !month || !day) return null

	// Treat date-only as a calendar date, independent of local timezone.
	const dt = new Date(Date.UTC(year, month - 1, day))
	if (Number.isNaN(dt.getTime())) return null

	// JS: 0..6 (Sun..Sat). API: 1..7 (Mon..Sun).
	return ((dt.getUTCDay() + 6) % 7) + 1
}

const formatDisplayDate = (value: string) => {
	const date = parseIsoDate(value)

	if (!date) return value

	return date.toLocaleDateString("ru-RU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	})
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
	(
		{
			label,
			error,
			helperText,
			allowedWeekDays,
			className,
			onChange,
			onBlur,
			onClick,
			...props
		},
		ref,
	) => {
		const {
			name,
			value,
			defaultValue,
			disabled,
			required,
			min,
			max,
			placeholder,
			...restProps
		} = props
		const id = props.id || name
		const wrapperRef = useRef<HTMLDivElement | null>(null)
		const isControlled = value !== undefined
		const [internalValue, setInternalValue] = useState(
			typeof defaultValue === "string" ? defaultValue : "",
		)
		const selectedValue = isControlled ? String(value ?? "") : internalValue
		const selectedDate = parseIsoDate(selectedValue)
		const [isOpen, setIsOpen] = useState(false)
		const [isTouch, setIsTouch] = useState<boolean | null>(null)
		const [viewMonth, setViewMonth] = useState<Date>(() => {
			return selectedDate || new Date()
		})

		const minDate = useMemo(() => parseIsoDate(min?.toString()), [min])
		const maxDate = useMemo(() => parseIsoDate(max?.toString()), [max])
		const years = useMemo(() => {
			const currentYear = new Date().getFullYear()
			const startYear = minDate ? minDate.getFullYear() : currentYear - 100
			const endYear = maxDate ? maxDate.getFullYear() : currentYear + 10

			return Array.from(
				{ length: endYear - startYear + 1 },
				(_, index) => startYear + index,
			)
		}, [maxDate, minDate])

		useEffect(() => {
			const nextSelectedDate = parseIsoDate(selectedValue)

			if (!nextSelectedDate) return

			const nextMonth = new Date(
				nextSelectedDate.getFullYear(),
				nextSelectedDate.getMonth(),
				1,
			)

			setViewMonth(current => {
				const isSameMonth =
					current.getFullYear() === nextMonth.getFullYear() &&
					current.getMonth() === nextMonth.getMonth()

				return isSameMonth ? current : nextMonth
			})
		}, [selectedValue])

		useEffect(() => {
			const media =
				typeof window !== "undefined"
					? window.matchMedia("(pointer: coarse)")
					: null

			if (!media) return

			const update = () => setIsTouch(media.matches)

			update()

			if (typeof media.addEventListener === "function") {
				media.addEventListener("change", update)

				return () => media.removeEventListener("change", update)
			}

			return undefined
		}, [])

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					wrapperRef.current &&
					!wrapperRef.current.contains(event.target as Node)
				) {
					setIsOpen(false)
					onBlur?.({
						target: { name, value: selectedValue },
					} as unknown as FocusEvent<HTMLInputElement>)
				}
			}

			document.addEventListener("mousedown", handleClickOutside)

			return () => document.removeEventListener("mousedown", handleClickOutside)
		}, [name, onBlur, selectedValue])

		useEffect(() => {
			if (isTouch) {
				setIsOpen(false)
			}
		}, [isTouch])

		const handleSelect = (date: Date) => {
			const nextValue = formatIsoDate(date)

			if (!isControlled) {
				setInternalValue(nextValue)
			}

			onChange?.({
				target: { name, value: nextValue },
			} as unknown as ChangeEvent<HTMLInputElement>)

			onBlur?.({
				target: { name, value: nextValue },
			} as unknown as FocusEvent<HTMLInputElement>)

			setIsOpen(false)
		}

		const days = useMemo(() => {
			const year = viewMonth.getFullYear()
			const month = viewMonth.getMonth()
			const firstDay = new Date(year, month, 1)
			const daysInMonth = new Date(year, month + 1, 0).getDate()
			const startOffset = (firstDay.getDay() + 6) % 7
			const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
			const cells: Array<Date | null> = []

			for (let i = 0; i < totalCells; i += 1) {
				const dayNumber = i - startOffset + 1

				if (dayNumber < 1 || dayNumber > daysInMonth) {
					cells.push(null)
				} else {
					cells.push(new Date(year, month, dayNumber))
				}
			}

			return cells
		}, [viewMonth])

		const canGoPrev = useMemo(() => {
			if (!minDate) return true

			const prevMonth = new Date(
				viewMonth.getFullYear(),
				viewMonth.getMonth() - 1,
				1,
			)

			return prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)
		}, [minDate, viewMonth])

		const canGoNext = useMemo(() => {
			if (!maxDate) return true

			const nextMonth = new Date(
				viewMonth.getFullYear(),
				viewMonth.getMonth() + 1,
				1,
			)

			return nextMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
		}, [maxDate, viewMonth])

		const displayValue = selectedValue ? formatDisplayDate(selectedValue) : ""
		const displayPlaceholder = placeholder || "Выберите дату"
		const today = new Date()
		const useNativePicker = isTouch !== false

		const handleNativeChange = (event: ChangeEvent<HTMLInputElement>) => {
			if (!isControlled) {
				setInternalValue(event.target.value)
			}

			onChange?.(event)
		}

		return (
			<div className={`${s.wrapper} ${className || ""}`} ref={wrapperRef}>
				{label && (
					<label htmlFor={id} className={s.label}>
						{label}

						{required && <span className={s.required}>*</span>}
					</label>
				)}

				{useNativePicker ? (
					<div className={s.inputWrapper}>
						<input
							ref={ref}
							id={id}
							type="date"
							className={`${s.input} ${s.nativeInput} ${error ? s.error : ""}`}
							aria-invalid={error ? "true" : "false"}
							aria-describedby={
								error ? `${id}-error` : helperText ? `${id}-helper` : undefined
							}
							value={selectedValue}
							placeholder={displayPlaceholder}
							disabled={disabled}
							name={name}
							required={required}
							min={min}
							max={max}
							onChange={handleNativeChange}
							onBlur={onBlur}
							onClick={onClick}
							{...restProps}
						/>
					</div>
				) : (
					<>
						<div className={`${s.inputWrapper} ${isOpen ? s.open : ""}`}>
							<input
								id={id}
								type="text"
								readOnly
								className={`${s.input} ${error ? s.error : ""}`}
								aria-invalid={error ? "true" : "false"}
								aria-describedby={
									error
										? `${id}-error`
										: helperText
											? `${id}-helper`
											: undefined
								}
								value={displayValue}
								placeholder={displayPlaceholder}
								disabled={disabled}
								onClick={event => {
									if (!disabled) setIsOpen(prev => !prev)
									onClick?.(event)
								}}
								{...restProps}
							/>

							<button
								type="button"
								className={s.calendarButton}
								aria-label="Открыть календарь"
								onClick={() => {
									if (!disabled) setIsOpen(prev => !prev)
								}}
								disabled={disabled}
							>
								<Calendar size={"1.8rem"} strokeWidth={2} />
							</button>
						</div>

						<input
							ref={ref}
							type="hidden"
							name={name}
							value={selectedValue}
							disabled={disabled}
							required={required}
							onChange={onChange}
							onBlur={onBlur}
						/>
					</>
				)}

				{isOpen && !disabled && (
					<div className={s.popover} role="dialog" aria-label="Выбор даты">
						<div className={s.calendarHeader}>
							<button
								type="button"
								className={s.navButton}
								onClick={() =>
									setViewMonth(
										prev =>
											new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
									)
								}
								disabled={!canGoPrev}
								aria-label="Предыдущий месяц"
							>
								<ChevronLeft size={"1.8rem"} strokeWidth={2} />
							</button>

							<div className={s.selectGroup}>
								<select
									className={s.select}
									value={viewMonth.getMonth()}
									onChange={event => {
										const nextMonth = Number(event.target.value)
										setViewMonth(
											prev => new Date(prev.getFullYear(), nextMonth, 1),
										)
									}}
								>
									{monthNames.map((month, index) => (
										<option key={month} value={index}>
											{month}
										</option>
									))}
								</select>

								<select
									className={s.select}
									value={viewMonth.getFullYear()}
									onChange={event => {
										const nextYear = Number(event.target.value)
										setViewMonth(prev => new Date(nextYear, prev.getMonth(), 1))
									}}
								>
									{years.map(year => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</div>

							<button
								type="button"
								className={s.navButton}
								onClick={() =>
									setViewMonth(
										prev =>
											new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
									)
								}
								disabled={!canGoNext}
								aria-label="Следующий месяц"
							>
								<ChevronRight size={"1.8rem"} strokeWidth={2} />
							</button>
						</div>

						<div className={s.weekdays}>
							{weekdays.map(day => (
								<span key={day}>{day}</span>
							))}
						</div>

						<div className={s.daysGrid}>
							{days.map((date, index) => {
								if (!date) {
									return <span key={`empty-${index}`} className={s.emptyDay} />
								}

								const iso = formatIsoDate(date)
								const isSelected = selectedValue === iso
								const isToday = formatIsoDate(today) === iso
								const isoWeekday = isoWeekdayFromDateOnly(iso)
								const isNotAllowedByWeekDay =
									Array.isArray(allowedWeekDays) &&
									allowedWeekDays.length > 0 &&
									isoWeekday !== null &&
									!allowedWeekDays.includes(isoWeekday)
								const isDisabled =
									(minDate ? date < minDate : false) ||
									(maxDate ? date > maxDate : false) ||
									isNotAllowedByWeekDay

								return (
									<button
										key={iso}
										type="button"
										className={`${s.dayButton} ${isSelected ? s.selected : ""} ${
											isToday ? s.today : ""
										}`}
										disabled={isDisabled}
										onClick={() => handleSelect(date)}
									>
										{date.getDate()}
									</button>
								)
							})}
						</div>
					</div>
				)}

				{helperText && !error && (
					<p id={`${id}-helper`} className={s.helper}>
						{helperText}
					</p>
				)}

				{error && <FormError message={error} />}
			</div>
		)
	},
)

DateInput.displayName = "DateInput"
