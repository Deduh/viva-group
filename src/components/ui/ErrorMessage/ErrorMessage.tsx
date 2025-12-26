import s from "./ErrorMessage.module.scss"

type ErrorMessageProps = {
	title?: string
	message?: string
	error?: Error | null
	retry?: () => void
	fullPage?: boolean
}

export function ErrorMessage({
	title = "Ошибка загрузки",
	message = "Не удалось загрузить данные. Попробуйте обновить страницу.",
	error,
	retry,
	fullPage = false,
}: ErrorMessageProps) {
	return (
		<div className={fullPage ? s.fullPage : s.container}>
			<div className={s.content}>
				<div className={s.icon}>❌</div>

				<h3 className={s.title}>{title}</h3>

				<p className={s.message}>{message}</p>

				{process.env.NODE_ENV === "development" && error && (
					<details className={s.details}>
						<summary>Детали ошибки (dev mode)</summary>

						<pre className={s.errorText}>{error.toString()}</pre>

						{error.stack && <pre className={s.stack}>{error.stack}</pre>}
					</details>
				)}

				{retry && (
					<button onClick={retry} className={s.button}>
						Попробовать снова
					</button>
				)}
			</div>
		</div>
	)
}
