import s from "./FormError.module.scss"

type FormErrorProps = {
	message?: string
}

export function FormError({ message }: FormErrorProps) {
	if (!message) return null

	return (
		<p className={s.error} role="alert">
			{message}
		</p>
	)
}
