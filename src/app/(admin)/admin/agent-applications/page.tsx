"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Modal } from "@/components/ui/Modal/Modal"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { AgentApplication } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import s from "./page.module.scss"

export default function AdminAgentApplicationsPage() {
	const { user, isLoading, requireRole } = useAuth()
	const { showSuccess, showError } = useToast()
	const queryClient = useQueryClient()
	const [selected, setSelected] = useState<AgentApplication | null>(null)

	useEffect(() => {
		requireRole("ADMIN")
	}, [requireRole])

	const applicationsQuery = useQuery({
		queryKey: ["agentApplications"],
		queryFn: async () => {
			try {
				return await api.getAgentApplications()
			} catch {
				return { items: [] }
			}
		},
	})

	const reviewMutation = useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: string
			status: "APPROVED" | "REJECTED"
		}) => api.updateAgentApplicationStatus(id, { status }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agentApplications"] })
			showSuccess("Заявка обновлена")
			setSelected(null)
		},
		onError: error => {
			showError(error instanceof Error ? error.message : "Не удалось обновить заявку")
		},
	})

	if (isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user) return null

	return (
		<div className={s.shell}>
			<div className={s.header}>
				<h1 className={s.title}>Заявки турагентов</h1>
				<p className={s.text}>
					После одобрения заявитель получает роль AGENT и отдельный чартерный
					режим.
				</p>
			</div>

			<div className={s.list}>
				{applicationsQuery.data?.items.length ? (
					applicationsQuery.data.items.map(application => (
						<button
							key={application.id}
							type="button"
							className={s.card}
							onClick={() => setSelected(application)}
						>
							<div className={s.cardTop}>
								<strong>{application.companyName}</strong>
								<span className={s.status} data-status={application.status}>
									{application.status}
								</span>
							</div>

							<p className={s.meta}>
								{application.contactName} · {application.email}
							</p>
							<p className={s.meta}>{application.phone}</p>
						</button>
					))
				) : (
					<div className={s.empty}>Пока нет заявок на агентский доступ.</div>
				)}
			</div>

			<Modal
				isOpen={!!selected}
				onClose={() => setSelected(null)}
				title={selected?.companyName}
				size="medium"
			>
				{selected && (
					<div className={s.modalBody}>
						<p>
							<strong>Контакт:</strong> {selected.contactName}
						</p>
						<p>
							<strong>Email:</strong> {selected.email}
						</p>
						<p>
							<strong>Телефон:</strong> {selected.phone}
						</p>
						{selected.website ? (
							<p>
								<strong>Сайт:</strong> {selected.website}
							</p>
						) : null}
						{selected.city ? (
							<p>
								<strong>Город:</strong> {selected.city}
							</p>
						) : null}
						{selected.comment ? (
							<p>
								<strong>Комментарий:</strong> {selected.comment}
							</p>
						) : null}

						<div className={s.actions}>
							<button
								type="button"
								className={s.approveButton}
								onClick={() =>
									reviewMutation.mutate({
										id: selected.id,
										status: "APPROVED",
									})
								}
								disabled={reviewMutation.isPending}
							>
								Одобрить
							</button>

							<button
								type="button"
								className={s.rejectButton}
								onClick={() =>
									reviewMutation.mutate({
										id: selected.id,
										status: "REJECTED",
									})
								}
								disabled={reviewMutation.isPending}
							>
								Отклонить
							</button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	)
}
