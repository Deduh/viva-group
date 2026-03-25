import { Footer } from "@/components/layout/Footer/Footer"
import { ReactNode } from "react"
import s from "./PublicWrapper.module.scss"

interface PublicWrapperProps {
	children: ReactNode
	showFooter?: boolean
	withHeaderOffset?: boolean
	headerOffsetMode?: "margin" | "padding"
}

export function PublicWrapper({
	children,
	showFooter = true,
	withHeaderOffset = true,
	headerOffsetMode = "margin",
}: PublicWrapperProps) {
	const offsetClass =
		withHeaderOffset && headerOffsetMode === "padding"
			? s.withHeaderOffsetPadding
			: withHeaderOffset
				? s.withHeaderOffset
				: ""

	return (
		<div
			className={`${s.wrapper} ${offsetClass}`}
			data-public-wrapper
		>
			<div className={s.content}>{children}</div>

			{showFooter && <Footer />}
		</div>
	)
}
