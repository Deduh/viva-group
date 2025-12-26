"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import s from "./Modal.module.scss"

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
	size?: "small" | "medium" | "large"
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "medium",
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null)
	const backdropRef = useRef<HTMLDivElement>(null)
	const lenis = useLenis()

	useGSAP(
		() => {
			if (!isOpen) return

			const backdrop = backdropRef.current
			const modal = modalRef.current

			if (!backdrop || !modal) return

			gsap.set(backdrop, { autoAlpha: 0 })
			gsap.set(modal, {
				y: 80,
				scale: 0.85,
				autoAlpha: 0,
				rotationX: 15,
				transformPerspective: 1000,
			})

			const tl = gsap.timeline()

			tl.to(backdrop, {
				autoAlpha: 1,
				duration: 0.5,
				ease: "power3.out",
			})

			tl.to(
				modal,
				{
					y: 0,
					scale: 1,
					autoAlpha: 1,
					rotationX: 0,
					duration: 0.8,
					ease: "power4.out",
				},
				"-=0.3"
			)

			return () => {
				tl.kill()
			}
		},
		{
			scope: backdropRef,
			dependencies: [isOpen],
			revertOnUpdate: true,
		}
	)

	useEffect(() => {
		if (!isOpen) return

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose()
			}
		}

		document.addEventListener("keydown", handleEscape)
		document.body.style.overflow = "hidden"

		if (lenis) {
			lenis.stop()
		}

		return () => {
			document.removeEventListener("keydown", handleEscape)
			document.body.style.overflow = ""

			if (lenis) {
				lenis.start()
			}
		}
	}, [isOpen, onClose, lenis])

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	return createPortal(
		<div ref={backdropRef} className={s.backdrop} onClick={handleBackdropClick}>
			<div
				ref={modalRef}
				className={`${s.modal} ${s[size]}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
				data-lenis-prevent
			>
				{title && (
					<div className={s.header}>
						<h2 id="modal-title" className={s.title}>
							{title}
						</h2>

						<button
							type="button"
							onClick={onClose}
							className={s.closeButton}
							aria-label="Закрыть"
						>
							×
						</button>
					</div>
				)}

				<div className={s.content}>{children}</div>
			</div>
		</div>,
		document.body
	)
}
