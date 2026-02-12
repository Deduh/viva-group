"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { registerSchema, type RegisterInput } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import gsap from "gsap"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLayoutEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import s from "./RegisterForm.module.scss"

export function RegisterForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get("callbackUrl") || "/client/tours"
	const { showError, showSuccess } = useToast()
	const { setIsTransitionComplete } = usePageTransition()
	const cardRef = useRef<HTMLDivElement>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	useLayoutEffect(() => {
		const card = cardRef.current
		const title = card?.querySelector("[data-register-title]")
		const subtitle = card?.querySelector("[data-register-subtitle]")

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
	} = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const onSubmit = async (data: RegisterInput) => {
		try {
			await api.registerUser({
				email: data.email,
				password: data.password,
				name: data.name,
			})

			showSuccess("Регистрация успешна! Входим...")

			const res = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
				callbackUrl,
			})

			if (res?.error) {
				showError("Не удалось авторизоваться после регистрации")
			} else {
				const targetUrl = res?.url || callbackUrl

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
			}
		} catch (err) {
			console.error(err)
			showError("Регистрация не удалась. Попробуйте еще раз.")
		}
	}

	return (
		<div ref={cardRef} className={s.card} data-register-card>
			<div className={s.header}>
				<h1 className={s.title}>Создать аккаунт</h1>

				<p className={s.subtitle}>
					Зарегистрируйтесь, чтобы управлять бронированиями и получать
					персональные предложения
				</p>
			</div>

			<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
				<div className={s.formWrapper}>
					<Input
						label="Имя"
						type="text"
						placeholder="Ваше имя"
						error={errors.name?.message}
						disabled={isSubmitting}
						{...register("name")}
					/>

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
						placeholder="Минимум 8 символов"
						helperText="Должен содержать заглавную букву, строчную и цифру"
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

					<Input
						label="Подтвердите пароль"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="Повторите пароль"
						error={errors.confirmPassword?.message}
						disabled={isSubmitting}
						rightElement={
							<button
								type="button"
								className={s.passwordToggle}
								onClick={() => setShowConfirmPassword(prev => !prev)}
								aria-label={
									showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
								}
								disabled={isSubmitting}
							>
								{showConfirmPassword ? (
									<EyeOff size={"1.8rem"} />
								) : (
									<Eye size={"1.8rem"} />
								)}
							</button>
						}
						{...register("confirmPassword")}
					/>
				</div>

				<div className={s.actions}>
					<button
						type="submit"
						disabled={isSubmitting}
						className={s.submitButton}
					>
						{isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
					</button>

					<TransitionLink
						href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
						className={s.ghostButton}
					>
						Уже есть аккаунт?
					</TransitionLink>
				</div>
			</form>
		</div>
	)
}
