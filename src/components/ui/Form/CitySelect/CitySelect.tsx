"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import s from "./CitySelect.module.scss"

interface CitySelectProps {
	label: string
	placeholder?: string
	options: readonly string[]
	value: string
	error?: string
	disabled?: boolean
	onChange: (next: string) => void
	onSelect?: (value: string) => void
	onBlur?: () => void
}

export function CitySelect({
	label,
	placeholder,
	options,
	value,
	error,
	disabled = false,
	onChange,
	onSelect,
	onBlur,
}: CitySelectProps) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const ignoreNextFocusOpenRef = useRef(false)

	const queryTrimmed = value.trim().toLowerCase()

	const filteredOptions = useMemo(() => {
		if (!queryTrimmed) return [...options]

		return options.filter(opt => opt.toLowerCase().includes(queryTrimmed))
	}, [options, queryTrimmed])

	useEffect(() => {
		if (!isOpen) return

		const onOutsideClick = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setIsOpen(false)
				onBlur?.()
			}
		}

		document.addEventListener("pointerdown", onOutsideClick)

		return () => document.removeEventListener("pointerdown", onOutsideClick)
	}, [isOpen, onBlur])

	useEffect(() => {
		if (!disabled) return

		setIsOpen(false)
	}, [disabled])

	const handleToggle = () => {
		if (disabled) return

		setIsOpen(prev => !prev)

		if (!isOpen) inputRef.current?.focus()
	}

	const select = (opt: string) => {
		onChange(opt)
		onSelect?.(opt)
		setIsOpen(false)
		ignoreNextFocusOpenRef.current = true
		inputRef.current?.focus()
	}

	return (
		<div className={s.wrapper} ref={rootRef}>
			<div className={s.field}>
				<Input
					ref={inputRef}
					label={label}
					type="text"
					value={value}
					placeholder={placeholder}
					error={error}
					disabled={disabled}
					onChange={event => {
						onChange(event.target.value)
						setIsOpen(true)
					}}
					onFocus={() => {
						if (ignoreNextFocusOpenRef.current) {
							ignoreNextFocusOpenRef.current = false
							return
						}

						setIsOpen(true)
					}}
					onBlur={() => {
						setTimeout(() => {
							if (!rootRef.current) return
							const active = document.activeElement
							if (active && rootRef.current.contains(active)) return
							setIsOpen(false)
							onBlur?.()
						}, 0)
					}}
					onKeyDown={event => {
						if (event.key === "Escape") {
							setIsOpen(false)
							return
						}

						if (event.key === "Enter") {
							event.preventDefault()
							if (filteredOptions.length > 0) {
								select(filteredOptions[0])
							}
						}
					}}
					rightElement={
						<button
							type="button"
							className={s.toggle}
							onClick={handleToggle}
							aria-label={isOpen ? "Закрыть список" : "Открыть список"}
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
									onClick={() => select(option)}
								>
									{option}
								</button>
							))
						)}
					</div>
				)}
			</div>
		</div>
	)
}
