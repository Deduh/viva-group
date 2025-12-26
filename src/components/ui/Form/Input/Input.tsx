import { forwardRef, type InputHTMLAttributes } from "react"
import { FormError } from "../FormError/FormError"
import s from "./Input.module.scss"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string
	error?: string
	helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, className, ...props }, ref) => {
		const id = props.id || props.name

		return (
			<div className={`${s.wrapper} ${className || ""}`}>
				{label && (
					<label htmlFor={id} className={s.label}>
						{label}

						{props.required && <span className={s.required}>*</span>}
					</label>
				)}

				<input
					ref={ref}
					id={id}
					className={`${s.input} ${error ? s.error : ""}`}
					aria-invalid={error ? "true" : "false"}
					aria-describedby={
						error ? `${id}-error` : helperText ? `${id}-helper` : undefined
					}
					{...props}
				/>

				{helperText && !error && (
					<p id={`${id}-helper`} className={s.helper}>
						{helperText}
					</p>
				)}

				{error && <FormError message={error} />}
			</div>
		)
	}
)

Input.displayName = "Input"
