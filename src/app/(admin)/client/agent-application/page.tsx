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
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import s from "./page.module.scss"

export default function ClientAgentApplicationPage() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { showError, showSuccess } = useToast()
	const { data: session, status, update } = useSession()
	const user = session?.user
	const role =
		user && typeof user.role === "string" && user.role.length > 0
			? user.role
			: null
	const roleRefreshAttemptedRef = useRef(false)
	const [isRefreshingRole, setIsRefreshingRole] = useState(false)
	const [submitConflictMessage, setSubmitConflictMessage] = useState<
		string | null
	>(null)

	const currentApplicationQuery = useQuery({
		queryKey: ["agent-application", "me", user?.id],
		queryFn: () => api.getCurrentAgentApplication(),
		enabled: status === "authenticated" && Boolean(user?.id),
	})
	const currentApplication = currentApplicationQuery.data?.item ?? null

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

		if (role === "CLIENT") {
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
		if (status !== "authenticated" || !user) return
		if (role !== "CLIENT") return
		if (currentApplication?.status !== "APPROVED") return
		if (roleRefreshAttemptedRef.current) return

		roleRefreshAttemptedRef.current = true
		setIsRefreshingRole(true)

		void update().finally(() => {
			setIsRefreshingRole(false)
		})
	}, [currentApplication?.status, role, status, update, user])

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

	const submitMutation = useMutation({
		mutationFn: (values: AgentApplicationCreateInput) =>
			api.createAgentApplication(values),
		onSuccess: application => {
			queryClient.setQueryData(["agent-application", "me", user?.id], {
				item: application,
			})
			setSubmitConflictMessage(null)
			showSuccess("Заявка на агентский доступ отправлена")
		},
		onError: async error => {
			if (error instanceof ApiError && error.statusCode === 409) {
				const persisted = await queryClient
					.fetchQuery({
						queryKey: ["agent-application", "me", user?.id],
						queryFn: () => api.getCurrentAgentApplication(),
					})
					.catch(() => null)

				if (
					error.code === "USER_ALREADY_AGENT" ||
					persisted?.item?.status === "APPROVED"
				) {
					setSubmitConflictMessage(null)
					setIsRefreshingRole(true)
					await update().finally(() => {
						setIsRefreshingRole(false)
					})
					return
				}

				setSubmitConflictMessage(
					persisted?.item?.status === "PENDING"
						? "Заявка уже отправлена и ожидает рассмотрения."
						: persisted?.item?.status === "REJECTED"
							? "Предыдущая заявка была отклонена. Проверьте причину ниже и подайте новую после корректировок."
							: "Сервер уже зафиксировал заявку или активировал агентский доступ.",
				)
				showError("Повторная отправка не требуется: статус уже сохранён на сервере")
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

	const rejectionReason = currentApplication?.rejectionReason?.trim()
	const statusCard = useMemo(() => {
		if (currentApplication?.status === "APPROVED") {
			return {
				status: "APPROVED" as const,
				title: "Агентский доступ одобрен",
				text: "Доступ уже одобрен на сервере. Обновляем роль аккаунта и переключаем кабинет в режим агента.",
			}
		}

		if (currentApplication?.status === "PENDING") {
			return {
				status: "PENDING" as const,
				title: "Заявка на рассмотрении",
				text: "Заявка уже отправлена. После проверки администратор откроет агентский доступ для этого аккаунта.",
			}
		}

		if (currentApplication?.status === "REJECTED") {
			return {
				status: "REJECTED" as const,
				title: "Заявка отклонена",
				text: "Заявка была отклонена. Исправьте данные с учётом причины ниже и отправьте новую заявку.",
			}
		}

		if (submitConflictMessage) {
			return {
				status: "CONFLICT" as const,
				title: "Повторная отправка заблокирована",
				text: submitConflictMessage,
			}
		}

		return null
	}, [currentApplication?.status, submitConflictMessage])

	if (
		status === "loading" ||
		isRefreshingRole ||
		(status === "authenticated" &&
			role === "CLIENT" &&
			currentApplicationQuery.isLoading)
	) {
		return (
			<div className={s.loadingShell}>
				<LoadingSpinner
					fullScreen
					text={
						isRefreshingRole ? "Обновляем агентский доступ..." : "Проверяем доступ..."
					}
				/>
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
							{statusCard.status === "APPROVED"
								? "Одобрено"
								: statusCard.status === "PENDING"
								? "На рассмотрении"
								: statusCard.status === "REJECTED"
									? "Отклонено"
									: "Уже отправлено"}
						</span>
						<h2 className={s.cardTitle}>{statusCard.title}</h2>
						<p className={s.cardText}>{statusCard.text}</p>
					</div>

					{currentApplication ? (
						<div className={s.meta}>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Компания</span>
								<span className={s.metaValue}>{currentApplication.companyName}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Контакт</span>
								<span className={s.metaValue}>{currentApplication.contactName}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Email</span>
								<span className={s.metaValue}>{currentApplication.email}</span>
							</div>
							<div className={s.metaItem}>
								<span className={s.metaLabel}>Телефон</span>
								<span className={s.metaValue}>{currentApplication.phone}</span>
							</div>
						</div>
					) : null}

					{rejectionReason ? (
						<p className={s.note}>
							<strong>Причина отклонения:</strong> {rejectionReason}
						</p>
					) : null}

					<p className={s.note}>
						Статус и роль подтягиваются с сервера. После одобрения кабинет
						автоматически переключится в режим агента.
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
