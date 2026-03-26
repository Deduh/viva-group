"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useToast } from "@/hooks/useToast"
import { AGENT_APPLICATION_PATH } from "@/lib/auth-redirect"
import { api } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import {
	agentApplicationCreateSchema,
	type AgentApplicationCreateInput,
} from "@/lib/validation"
import type { AgentApplication } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import s from "./page.module.scss"

type LocalAgentApplicationState = {
	application: AgentApplication
}

const LOCAL_APPLICATION_KEY_PREFIX = "agent-application:"

function getLocalStorageKey(userId: string) {
	return `${LOCAL_APPLICATION_KEY_PREFIX}${userId}`
}

export default function ClientAgentApplicationPage() {
	const router = useRouter()
	const { showError, showSuccess } = useToast()
	const { data: session, status, update } = useSession()
	const user = session?.user
	const role =
		user && typeof user.role === "string" && user.role.length > 0
			? user.role
			: null
	const roleRefreshAttemptedRef = useRef(false)
	const [isRefreshingRole, setIsRefreshingRole] = useState(false)
	const [localApplication, setLocalApplication] =
		useState<AgentApplication | null>(null)
	const [sessionConflictLocked, setSessionConflictLocked] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AgentApplicationCreateInput>({
		resolver: zodResolver(agentApplicationCreateSchema),
		defaultValues: {
			companyName: "",
			contactName: "",
			email: "",
			phone: "",
			website: "",
			city: "",
			comment: "",
		},
	})

	useEffect(() => {
		if (status === "loading" || status === "authenticated") return

		router.replace(
			`/login?callbackUrl=${encodeURIComponent(AGENT_APPLICATION_PATH)}`,
		)
	}, [router, status])

	useEffect(() => {
		if (status !== "authenticated") return
		if (!user) return
		if (role === "CLIENT") return

		if (role === "AGENT") {
			router.replace("/agent/flights")

			return
		}

		if (role === "ADMIN") {
			router.replace("/admin/tours")

			return
		}

		if (role === "MANAGER") {
			router.replace("/manager/tours")

			return
		}

		if (roleRefreshAttemptedRef.current) {
			router.replace(
				`/login?callbackUrl=${encodeURIComponent(AGENT_APPLICATION_PATH)}`,
			)

			return
		}

		roleRefreshAttemptedRef.current = true
		setIsRefreshingRole(true)

		void update().finally(() => {
			setIsRefreshingRole(false)
		})
	}, [role, router, status, update, user])

	useEffect(() => {
		if (!user) return

		reset({
			companyName: "",
			contactName: user.name || "",
			email: user.email || "",
			phone: "",
			website: "",
			city: "",
			comment: "",
		})
	}, [reset, user])

	useEffect(() => {
		if (!user?.id || typeof window === "undefined") return

		try {
			// Temporary session-only fallback until backend exposes a dedicated
			// endpoint like GET /api/agent-applications/me for persisted status.
			const rawValue = window.sessionStorage.getItem(getLocalStorageKey(user.id))

			if (!rawValue) {
				setLocalApplication(null)
				return
			}

			const parsed = JSON.parse(rawValue) as LocalAgentApplicationState
			setLocalApplication(parsed.application)
		} catch {
			setLocalApplication(null)
		}
	}, [user?.id])

	const persistLocalApplication = (application: AgentApplication) => {
		setLocalApplication(application)

		if (!user?.id || typeof window === "undefined") return

		window.sessionStorage.setItem(
			getLocalStorageKey(user.id),
			JSON.stringify({ application }),
		)
	}

	const submitMutation = useMutation({
		mutationFn: (values: AgentApplicationCreateInput) =>
			api.createAgentApplication(values),
		onSuccess: application => {
			persistLocalApplication(application)
			setSessionConflictLocked(false)
			showSuccess("Заявка на агентский доступ отправлена")
		},
		onError: error => {
			if (error instanceof ApiError && error.statusCode === 409) {
				setSessionConflictLocked(true)
				showError("Сервер уже зафиксировал заявку или агентский статус")
				return
			}

			showError(
				error instanceof Error
					? error.message
					: "Не удалось отправить заявку",
			)
		},
	})

	const onSubmit = (values: AgentApplicationCreateInput) => {
		submitMutation.mutate(values)
	}

	const rejectionReason = localApplication?.rejectionReason?.trim()
	const statusCard = useMemo(() => {
		if (localApplication?.status === "PENDING") {
			return {
				status: "PENDING" as const,
				title: "Заявка на рассмотрении",
				text: "Заявка уже отправлена. После проверки администратор откроет агентский доступ для этого аккаунта.",
			}
		}

		if (localApplication?.status === "REJECTED") {
			return {
				status: "REJECTED" as const,
				title: "Заявка отклонена",
				text: "Сейчас повторная подача автоматически не синхронизируется, потому что на фронте нет отдельного endpoint статуса моей заявки.",
			}
		}

		if (sessionConflictLocked) {
			return {
				status: "CONFLICT" as const,
				title: "Повторная отправка заблокирована",
				text: "Сервер сообщил, что заявка уже существует или агентский статус уже активирован. Без отдельного endpoint вида GET /api/agent-applications/me фронт не может надежно показать точный persisted-статус.",
			}
		}

		return null
	}, [localApplication?.status, sessionConflictLocked])

	if (status === "loading" || isRefreshingRole) {
		return (
			<div className={s.loadingShell}>
				<LoadingSpinner fullScreen text="Проверяем доступ..." />
			</div>
		)
	}

	if (status === "unauthenticated" || !user || role !== "CLIENT") {
		return (
			<div className={s.loadingShell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<section className={s.hero}>
				<span className={s.eyebrow}>Стать агентом</span>
				<h1 className={s.title}>Заявка на агентский доступ</h1>
				<p className={s.text}>
					Сначала вы остаетесь обычным клиентом. После одобрения на backend ваша
					роль сменится на <strong>AGENT</strong>, и кабинет переключится на
					агентский режим.
				</p>
			</section>

			{statusCard ? (
				<section className={s.card}>
					<div className={s.cardHeader}>
						<span className={s.statusBadge} data-status={statusCard.status}>
							{statusCard.status === "PENDING"
								? "На рассмотрении"
								: statusCard.status === "REJECTED"
									? "Отклонено"
									: "Уже отправлено"}
						</span>
						<h2 className={s.cardTitle}>{statusCard.title}</h2>
						<p className={s.cardText}>{statusCard.text}</p>
					</div>

					{localApplication ? (
						<div className={s.meta}>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Компания</span>
								<span className={s.metaValue}>{localApplication.companyName}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Контакт</span>
								<span className={s.metaValue}>{localApplication.contactName}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Email</span>
								<span className={s.metaValue}>{localApplication.email}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Телефон</span>
								<span className={s.metaValue}>{localApplication.phone}</span>
							</div>
						</div>
					) : null}

					{rejectionReason ? (
						<p className={s.note}>
							<strong>Причина отклонения:</strong> {rejectionReason}
						</p>
					) : null}

					<p className={s.note}>
						Если статус недавно менялся на backend, он может подтянуться не
						сразу. В таком случае откройте страницу позже или заново войдите в
						аккаунт, чтобы обновить роль и доступы.
					</p>

					<div className={s.actions}>
						<TransitionLink href="/for-agents" className={s.secondaryButton}>
							Условия для турагентов
						</TransitionLink>
					</div>
				</section>
			) : (
				<section className={s.card}>
					<div className={s.cardHeader}>
						<h2 className={s.cardTitle}>Форма агентской заявки</h2>
						<p className={s.cardText}>
							Заполните данные агентства. Backend сам свяжет заявку с текущим
							авторизованным пользователем, но фронт отправляет полный набор
							полей контракта.
						</p>
					</div>

					<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
						<div className={s.grid}>
							<Input
								label="Название агентства"
								error={errors.companyName?.message}
								disabled={submitMutation.isPending}
								{...register("companyName")}
							/>
							<Input
								label="Контактное лицо"
								error={errors.contactName?.message}
								disabled={submitMutation.isPending}
								{...register("contactName")}
							/>
							<Input
								label="Email"
								type="email"
								error={errors.email?.message}
								disabled={submitMutation.isPending}
								{...register("email")}
							/>
							<Input
								label="Телефон"
								error={errors.phone?.message}
								disabled={submitMutation.isPending}
								{...register("phone")}
							/>
							<Input
								label="Сайт"
								error={errors.website?.message}
								disabled={submitMutation.isPending}
								{...register("website")}
							/>
							<Input
								label="Город"
								error={errors.city?.message}
								disabled={submitMutation.isPending}
								{...register("city")}
							/>
						</div>

						<TextArea
							label="Комментарий"
							rows={5}
							error={errors.comment?.message}
							disabled={submitMutation.isPending}
							{...register("comment")}
						/>

						<div className={s.actions}>
							<button
								type="submit"
								className={s.primaryButton}
								disabled={submitMutation.isPending}
							>
								{submitMutation.isPending ? "Отправляем..." : "Отправить заявку"}
							</button>

							<TransitionLink href="/for-agents" className={s.secondaryButton}>
								Условия для турагентов
							</TransitionLink>
						</div>
					</form>
				</section>
			)}
		</div>
	)
}
