"use client"

import s from "./ErrorBoundary.module.scss"

interface SectionErrorFallbackProps {
	title?: string
	message?: string
	onRetry?: () => void
}

export function SectionErrorFallback({
	title = "Ошибка загрузки",
	message = "Не удалось загрузить этот раздел. Попробуйте обновить страницу.",
	onRetry,
}: SectionErrorFallbackProps) {
	return (
		<div className={s.container}>
			<div className={s.content}>
				<div className={s.icon}>⚠️</div>

				<h3 className={s.title}>{title}</h3>

				<p className={s.message}>{message}</p>

				{onRetry && (
					<button className={s.button} onClick={onRetry}>
						Попробовать снова
					</button>
				)}
			</div>
		</div>
	)
}
