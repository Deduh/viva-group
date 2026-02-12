"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useToast } from "@/hooks/useToast"
import { loginSchema, type LoginInput } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import gsap from "gsap"
import { Eye, EyeOff } from "lucide-react"
import { getSession, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLayoutEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import s from "./LoginForm.module.scss"

export function LoginForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrlParam = searchParams.get("callbackUrl")
	const hasCallbackUrl = !!callbackUrlParam
	const { showError, showSuccess } = useToast()
	const { setIsTransitionComplete } = usePageTransition()
	const cardRef = useRef<HTMLDivElement>(null)
	const [showPassword, setShowPassword] = useState(false)

	useLayoutEffect(() => {
		const card = cardRef.current
		const title = card?.querySelector("[data-login-title]")
		const subtitle = card?.querySelector("[data-login-subtitle]")

		if (card) {
			gsap.set(card, { y: 60, autoAlpha: 0 })
		}

		if (title) {
			gsap.set(title, { y: 40, autoAlpha: 0 })
		}

		if (subtitle) {
			gsap.set(subtitle, { y: 40, autoAlpha: 0 })
		}

		return () => {
			if (card) {
				gsap.set(card, { clearProps: "all" })
			}

			if (title) {
				gsap.set(title, { clearProps: "all" })
			}

			if (subtitle) {
				gsap.set(subtitle, { clearProps: "all" })
			}
		}
	}, [])

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = async (data: LoginInput) => {
		const resolvedCallbackUrl = (() => {
			if (!callbackUrlParam) return null

			try {
				const resolved = new URL(callbackUrlParam, window.location.origin)

				if (resolved.origin !== window.location.origin) {
					return null
				}

				return `${resolved.pathname}${resolved.search}${resolved.hash}`
			} catch {
				return null
			}
		})()

		try {
			const res = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
				callbackUrl: resolvedCallbackUrl ?? undefined,
			})

			if (!res) {
				showError("Нет ответа от сервера авторизации")

				return
			}

			if (res.error) {
				showError("Неверный email или пароль")

				return
			}

			showSuccess("Успешный вход!")

			const session = await getSession()
			const role = session?.user?.role

			const roleFallback =
				role === "ADMIN"
					? "/manager/tours"
					: role === "MANAGER"
						? "/manager/tours"
						: "/client/tours"

			const callbackPath = res.url || resolvedCallbackUrl

			const callbackAllowed = (() => {
				if (!callbackPath || !role) return false

				if (callbackPath.startsWith("/admin")) return role === "ADMIN"

				if (callbackPath.startsWith("/manager"))
					return role === "ADMIN" || role === "MANAGER"

				if (callbackPath.startsWith("/client")) return role === "CLIENT"

				return true
			})()

			const targetUrl =
				hasCallbackUrl && callbackAllowed && callbackPath
					? callbackPath
					: roleFallback

			const container = document.getElementById("page-transition-container")

			if (!container) {
				router.push(targetUrl)

				return
			}

			const columns = container.querySelectorAll(`[data-transition-column]`)

			if (columns.length === 0) {
				router.push(targetUrl)

				return
			}

			container.style.pointerEvents = "auto"

			gsap.set(columns, { yPercent: -100 })

			gsap.to(columns, {
				yPercent: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: "power4.inOut",
				onComplete: () => {
					setIsTransitionComplete(false)
					router.push(targetUrl)
				},
			})
		} catch {
			showError("Что-то пошло не так. Попробуйте снова.")
		}
	}

	return (
		<div ref={cardRef} className={s.card} data-login-card>
			<div className={s.header}>
				<h1 className={s.title}>Вход в систему</h1>

				<p className={s.subtitle}>
					Войдите в свой аккаунт для доступа к личному кабинету и управлению
					бронированиями
				</p>
			</div>

			<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
				<div className={s.formWrapper}>
					<Input
						label="Email"
						type="email"
						placeholder="your@email.com"
						error={errors.email?.message}
						disabled={isSubmitting}
						{...register("email")}
					/>

					<Input
						label="Пароль"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						error={errors.password?.message}
						disabled={isSubmitting}
						rightElement={
							<button
								type="button"
								className={s.passwordToggle}
								onClick={() => setShowPassword(prev => !prev)}
								aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
								disabled={isSubmitting}
							>
								{showPassword ? (
									<EyeOff size={"1.8rem"} />
								) : (
									<Eye size={"1.8rem"} />
								)}
							</button>
						}
						{...register("password")}
					/>
				</div>

				<div className={s.actions}>
					<button
						type="submit"
						disabled={isSubmitting}
						className={s.submitButton}
					>
						{isSubmitting ? "Входим..." : "Войти"}
					</button>

					<TransitionLink
						href={
							callbackUrlParam
								? `/register?callbackUrl=${encodeURIComponent(callbackUrlParam)}`
								: "/register"
						}
						className={s.ghostButton}
					>
						Создать аккаунт
					</TransitionLink>
				</div>
			</form>
		</div>
	)
}
