"use client"

import gsap from "gsap"
import { memo, useLayoutEffect, useRef } from "react"
import s from "./LoginHero.module.scss"

interface LoginHeroProps {
	titleRef?: React.RefObject<HTMLHeadingElement>
	subtitleRef?: React.RefObject<HTMLParagraphElement>
}

export const LoginHero = memo(function LoginHero({
	titleRef: externalTitleRef,
	subtitleRef: externalSubtitleRef,
}: LoginHeroProps = {}) {
	const internalTitleRef = useRef<HTMLHeadingElement>(null)
	const internalSubtitleRef = useRef<HTMLParagraphElement>(null)

	const titleRef = externalTitleRef || internalTitleRef
	const subtitleRef = externalSubtitleRef || internalSubtitleRef

	useLayoutEffect(() => {
		const title = titleRef.current
		const subtitle = subtitleRef.current

		if (title) {
			gsap.set(title, { y: 40, autoAlpha: 0 })
		}

		if (subtitle) {
			gsap.set(subtitle, { y: 40, autoAlpha: 0 })
		}

		return () => {
			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (subtitle) {
				gsap.set(subtitle, { clearProps: "all" })
			}
		}
	}, [titleRef, subtitleRef])

	return (
		<section className={s.hero} data-login-hero>
			<h1 ref={titleRef} className={s.title}>
				Вход в систему
			</h1>

			<p ref={subtitleRef} className={s.subtitle}>
				Войдите в свой аккаунт для доступа к личному кабинету и управлению
				бронированиями
			</p>
		</section>
	)
})
