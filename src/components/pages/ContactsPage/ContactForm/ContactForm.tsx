"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { contactSchema, type ContactInput } from "@/lib/validation"
import { useGSAP } from "@gsap/react"
import { zodResolver } from "@hookform/resolvers/zod"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import s from "./ContactForm.module.scss"

gsap.registerPlugin(ScrollTrigger)

export function ContactForm() {
	const cardRef = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			if (!cardRef.current) return

			gsap.set("[data-contacts-form-card]", { y: 60, opacity: 0, scale: 0.9 })

			const animation = gsap.to("[data-contacts-form-card]", {
				y: 0,
				opacity: 1,
				scale: 1,
				duration: 0.8,
				ease: "power3.out",
				scrollTrigger: {
					trigger: cardRef.current,
					start: "top 75%",
					toggleActions: "play none none reverse",
				},
				clearProps: "all",
			})

			return () => {
				if (animation.scrollTrigger) {
					animation.scrollTrigger.kill()
				}
				animation.kill()
			}
		},
		{ scope: cardRef, dependencies: [] }
	)
	const { showSuccess, showError } = useToast()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ContactInput>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			message: "",
		},
	})

	const onSubmit = async (data: ContactInput) => {
		try {
			await api.createContactRequest({
				name: data.name.trim(),
				email: data.email.trim(),
				phone: data.phone?.trim() || undefined,
				message: data.message.trim(),
			})

			showSuccess("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.")
			reset()
		} catch (error) {
			console.error(error)
			const message =
				error instanceof Error
					? error.message
					: "Ошибка при отправке сообщения. Попробуйте позже."
			showError(message)
		}
	}

	return (
		<section ref={cardRef} className={s.section}>
			<div className={s.container}>
				<div className={s.card} data-contacts-form-card>
					<h2 className={s.cardTitle}>Напишите нам</h2>
					<form onSubmit={handleSubmit(onSubmit)} className={s.form}>
						<Input
							label="Имя"
							type="text"
							placeholder="Ваше имя"
							error={errors.name?.message}
							disabled={isSubmitting}
							required
							{...register("name")}
						/>

						<Input
							label="Email"
							type="email"
							placeholder="your@email.com"
							error={errors.email?.message}
							disabled={isSubmitting}
							required
							{...register("email")}
						/>

						<Input
							label="Телефон"
							type="tel"
							placeholder="+7 (___) ___-__-__"
							error={errors.phone?.message}
							disabled={isSubmitting}
							helperText="Необязательное поле"
							{...register("phone")}
						/>

						<TextArea
							label="Сообщение"
							placeholder="Расскажите о ваших планах..."
							rows={6}
							maxLength={1000}
							showCharCount
							error={errors.message?.message}
							disabled={isSubmitting}
							required
							{...register("message")}
						/>

						<button
							type="submit"
							disabled={isSubmitting}
							className={s.submitButton}
						>
							{isSubmitting ? <>Отправка...</> : <>Отправить сообщение</>}
						</button>
					</form>
				</div>
			</div>
		</section>
	)
}
