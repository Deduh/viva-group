import { forwardRef, type TextareaHTMLAttributes } from "react"
import { FormError } from "../FormError/FormError"
import s from "./TextArea.module.scss"

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label?: string
	error?: string
	helperText?: string
	showCharCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	(
		{ label, error, helperText, showCharCount, className, maxLength, ...props },
		ref
	) => {
		const id = props.id || props.name
		const currentLength = props.value?.toString().length || 0

		return (
			<div className={`${s.wrapper} ${className || ""}`}>
				{label && (
					<label htmlFor={id} className={s.label}>
						{label}

						{props.required && <span className={s.required}>*</span>}
					</label>
				)}

				<textarea
					ref={ref}
					id={id}
					className={`${s.textarea} ${error ? s.error : ""}`}
					aria-invalid={error ? "true" : "false"}
					aria-describedby={
						error ? `${id}-error` : helperText ? `${id}-helper` : undefined
					}
					maxLength={maxLength}
					{...props}
				/>

				<div className={s.footer}>
					{helperText && !error && (
						<p id={`${id}-helper`} className={s.helper}>
							{helperText}
						</p>
					)}

					{showCharCount && maxLength && (
						<span className={s.charCount}>
							{currentLength} / {maxLength}
						</span>
					)}
				</div>

				{error && <FormError message={error} />}
			</div>
		)
	}
)

TextArea.displayName = "TextArea"
