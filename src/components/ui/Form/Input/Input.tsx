import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { FormError } from "../FormError/FormError"
import s from "./Input.module.scss"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string
	error?: string
	helperText?: string
	rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, className, rightElement, ...props }, ref) => {
		const id = props.id || props.name
		const hasRightElement = Boolean(rightElement)

		return (
			<div className={`${s.wrapper} ${className || ""}`}>
				{label && (
					<label htmlFor={id} className={s.label}>
						{label}

						{props.required && <span className={s.required}>*</span>}
					</label>
				)}

				<div className={s.field}>
					<input
						ref={ref}
						id={id}
						className={`${s.input} ${error ? s.error : ""} ${
							hasRightElement ? s.inputWithAdornment : ""
						}`}
						aria-invalid={error ? "true" : "false"}
						aria-describedby={
							error ? `${id}-error` : helperText ? `${id}-helper` : undefined
						}
						{...props}
					/>

					{rightElement && <div className={s.rightElement}>{rightElement}</div>}
				</div>

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

Input.displayName = "Input"
