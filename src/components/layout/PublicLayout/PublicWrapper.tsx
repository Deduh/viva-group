import { Footer } from "@/components/layout/Footer/Footer"
import { ReactNode } from "react"
import s from "./PublicWrapper.module.scss"

interface PublicWrapperProps {
	children: ReactNode
	showFooter?: boolean
}

export function PublicWrapper({
	children,
	showFooter = true,
}: PublicWrapperProps) {
	return (
		<div className={s.wrapper} data-public-wrapper>
			<div className={s.content}>{children}</div>

			{showFooter && <Footer />}
		</div>
	)
}
