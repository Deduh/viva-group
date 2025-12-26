"use client"

import { Component, type ReactNode } from "react"
import s from "./ErrorBoundary.module.scss"

type ErrorBoundaryProps = {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

type ErrorBoundaryState = {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo)

		this.props.onError?.(error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className={s.container}>
					<div className={s.content}>
						<div className={s.icon}>⚠️</div>

						<h2 className={s.title}>Что-то пошло не так</h2>

						<p className={s.message}>
							Произошла ошибка при загрузке этого раздела.
						</p>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className={s.details}>
								<summary>Детали ошибки</summary>

								<pre className={s.error}>{this.state.error.toString()}</pre>
							</details>
						)}

						<button
							className={s.button}
							onClick={() => window.location.reload()}
						>
							Перезагрузить страницу
						</button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}
