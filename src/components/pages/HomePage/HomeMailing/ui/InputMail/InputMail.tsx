import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { useForm } from "react-hook-form"
import s from "./InputMail.module.scss"

type FormValues = {
	email: string
}

export function InputMail() {
	const { showError, showSuccess } = useToast()
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		defaultValues: { email: "" },
	})

	const onSubmit = async ({ email }: FormValues) => {
		try {
			await api.subscribeMailing({ email })
			showSuccess("Спасибо! Подписка оформлена.")
			reset()
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Не удалось оформить подписку. Попробуйте позже."
			showError(message)
		}
	}

	const onInvalid = () => {
		showError("Введите корректный email")
	}

	return (
		<form
			className={s.form}
			onSubmit={handleSubmit(onSubmit, onInvalid)}
			noValidate
		>
			<div className={s.inputWrapper}>
				<input
					className={s.input}
					type="email"
					placeholder="Введите ваш E-mail"
					aria-invalid={!!errors.email}
					disabled={isSubmitting}
					{...register("email", {
						required: "Email обязателен",
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: "Некорректный email",
						},
					})}
				/>

				<button className={s.button} type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Отправляем..." : "Подписаться"}
				</button>
			</div>

			{errors.email && (
				<span className={s.errorText}>{errors.email.message}</span>
			)}
		</form>
	)
}
