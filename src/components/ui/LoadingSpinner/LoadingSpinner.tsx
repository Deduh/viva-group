import s from "./LoadingSpinner.module.scss"

type LoadingSpinnerProps = {
	size?: "small" | "medium" | "large"
	fullScreen?: boolean
	text?: string
}

export function LoadingSpinner({
	size = "medium",
	fullScreen = false,
	text,
}: LoadingSpinnerProps) {
	const Container = fullScreen ? "div" : "span"

	return (
		<Container className={fullScreen ? s.fullscreen : s.inline}>
			<div className={`${s.spinner} ${s[size]}`}>
				<div className={s.circle} />
			</div>

			{text && <p className={s.text}>{text}</p>}
		</Container>
	)
}
