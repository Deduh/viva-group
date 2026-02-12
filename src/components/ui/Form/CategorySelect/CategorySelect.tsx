"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { ChevronDown, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import s from "./CategorySelect.module.scss"

interface CategorySelectProps {
	label: string
	placeholder?: string
	options: readonly string[]
	selectedValues: string[]
	error?: string
	disabled?: boolean
	onChange: (next: string[]) => void
}

export function CategorySelect({
	label,
	placeholder = "Выберите категорию",
	options,
	selectedValues,
	error,
	disabled = false,
	onChange,
}: CategorySelectProps) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState("")

	const queryTrimmed = query.trim().toLowerCase()

	const filteredOptions = useMemo(() => {
		return options.filter(option => {
			if (selectedValues.includes(option)) return false
			if (!queryTrimmed) return true

			return option.toLowerCase().includes(queryTrimmed)
		})
	}, [options, queryTrimmed, selectedValues])

	const addValue = (value: string) => {
		if (selectedValues.includes(value)) return

		onChange([...selectedValues, value])
		setQuery("")
		setIsOpen(true)
		inputRef.current?.focus()
	}

	const removeValue = (value: string) => {
		onChange(selectedValues.filter(v => v !== value))
	}

	useEffect(() => {
		if (!isOpen) return

		const onOutsideClick = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setIsOpen(false)
				setQuery("")
			}
		}

		document.addEventListener("pointerdown", onOutsideClick)

		return () => document.removeEventListener("pointerdown", onOutsideClick)
	}, [isOpen])

	useEffect(() => {
		if (!disabled) return

		setIsOpen(false)
		setQuery("")
	}, [disabled])

	const handleToggle = () => {
		if (isOpen) {
			setIsOpen(false)

			return
		}

		setIsOpen(true)
		inputRef.current?.focus()
	}

	return (
		<div className={s.wrapper} ref={rootRef}>
			<div className={s.field}>
				<Input
					ref={inputRef}
					label={label}
					type="text"
					value={query}
					placeholder={placeholder}
					error={error}
					disabled={disabled}
					onChange={event => {
						setQuery(event.target.value)
						setIsOpen(true)
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={event => {
						if (event.key === "Escape") {
							setIsOpen(false)
							return
						}

						if (event.key === "Enter") {
							event.preventDefault()
							if (filteredOptions.length > 0) {
								addValue(filteredOptions[0])
							}
						}
					}}
					rightElement={
						<button
							type="button"
							className={s.toggle}
							onClick={handleToggle}
							aria-label={
								isOpen ? "Закрыть список категорий" : "Открыть список категорий"
							}
							aria-expanded={isOpen}
							disabled={disabled}
						>
							<ChevronDown
								size={"1.6rem"}
								className={isOpen ? s.toggleOpen : ""}
							/>
						</button>
					}
				/>

				{isOpen && !disabled && (
					<div
						className={s.menu}
						data-lenis-prevent
						onWheel={e => e.stopPropagation()}
						onTouchMove={e => e.stopPropagation()}
					>
						{filteredOptions.length === 0 ? (
							<div className={s.empty}>Ничего не найдено</div>
						) : (
							filteredOptions.map(option => (
								<button
									key={option}
									type="button"
									className={s.option}
									onClick={() => addValue(option)}
								>
									{option}
								</button>
							))
						)}
					</div>
				)}
			</div>

			{selectedValues.length > 0 && (
				<div className={s.selected}>
					{selectedValues.map(value => (
						<span key={value} className={s.chip}>
							<span>{value}</span>

							<button
								type="button"
								className={s.remove}
								onClick={() => removeValue(value)}
								aria-label={`Удалить категорию ${value}`}
								disabled={disabled}
							>
								<X size={"1.2rem"} />
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	)
}
