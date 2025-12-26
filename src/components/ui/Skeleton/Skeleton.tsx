import s from "./Skeleton.module.scss"

type SkeletonProps = {
	width?: string | number
	height?: string | number
	variant?: "text" | "circular" | "rectangular"
	className?: string
}

export function Skeleton({
	width,
	height,
	variant = "rectangular",
	className,
}: SkeletonProps) {
	const style = {
		width: typeof width === "number" ? `${width}rem` : width,
		height: typeof height === "number" ? `${height}rem` : height,
	}

	return (
		<div
			className={`${s.skeleton} ${s[variant]} ${className || ""}`}
			style={style}
		/>
	)
}
