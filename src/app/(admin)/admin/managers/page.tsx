"use client"

import { ManagerDeleteConfirm } from "@/components/pages/AdminManagersPage/ManagerForm/ManagerDeleteConfirm"
import { ManagerForm } from "@/components/pages/AdminManagersPage/ManagerForm/ManagerForm"
import { ManagersSection } from "@/components/pages/AdminManagersPage/ManagersSection/ManagersSection"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Modal } from "@/components/ui/Modal/Modal"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import type { CreateManagerInput, UpdateManagerInput, User } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import s from "./page.module.scss"

export default function AdminManagersPage() {
	const { user, isLoading, requireRole } = useAuth()
	const [search, setSearch] = useState("")
	const [editingManager, setEditingManager] = useState<User | null>(null)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [managerToDelete, setManagerToDelete] = useState<User | null>(null)
	const queryClient = useQueryClient()

	useEffect(() => {
		requireRole("ADMIN")
	}, [requireRole])

	const managersQuery = useQuery({
		queryKey: ["managers"],
		queryFn: api.getManagers,
	})

	const createManager = useMutation({
		mutationFn: (data: CreateManagerInput) => api.createManager(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["managers"] })
			setIsCreateOpen(false)
		},
	})

	const updateManager = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateManagerInput }) =>
			api.updateManager(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["managers"] })
			setEditingManager(null)
		},
	})

	const deleteManager = useMutation({
		mutationFn: (id: string) => api.deleteManager(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["managers"] })
			setEditingManager(null)
			setManagerToDelete(null)
		},
	})

	const managers = useMemo(
		() => managersQuery.data?.items || [],
		[managersQuery.data?.items]
	)

	const filteredManagers = useMemo(() => {
		if (!search.trim()) return managers

		const term = search.toLowerCase()

		return managers.filter(m =>
			[m.name, m.email, m.phone].some(field =>
				field?.toLowerCase().includes(term)
			)
		)
	}, [managers, search])

	if (isLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<div className={s.shell}>
			<ManagersSection
				managers={filteredManagers}
				isLoading={managersQuery.isLoading}
				onCreate={() => setIsCreateOpen(true)}
				onEdit={manager => setEditingManager(manager)}
				onDelete={manager => setManagerToDelete(manager)}
				search={search}
				onSearchChange={setSearch}
			/>

			<Modal
				isOpen={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				title="Добавить менеджера"
				size="small"
			>
				<ManagerForm
					onSubmit={async data => {
						const payload: CreateManagerInput = {
							email: data.email,
							name: data.name || undefined,
							phone: data.phone || undefined,
							password: data.password?.trim() || undefined,
							status: data.status,
							role: data.role,
						}

						await createManager.mutateAsync(payload)
					}}
					isSubmitting={createManager.isPending}
					onCancel={() => setIsCreateOpen(false)}
				/>
			</Modal>

			<Modal
				isOpen={!!editingManager}
				onClose={() => setEditingManager(null)}
				title="Редактировать менеджера"
				size="small"
			>
				{editingManager && (
					<ManagerForm
						manager={editingManager}
						onSubmit={async data => {
							const payload: UpdateManagerInput = {
								name: data.name || undefined,
								phone: data.phone || undefined,
								status: data.status,
								role: data.role,
								password: data.password?.trim() || undefined,
							}

							await updateManager.mutateAsync({
								id: editingManager.id,
								data: payload,
							})
						}}
						isSubmitting={updateManager.isPending}
						onCancel={() => setEditingManager(null)}
					/>
				)}
			</Modal>

			<ManagerDeleteConfirm
				isOpen={!!managerToDelete}
				onClose={() => setManagerToDelete(null)}
				onConfirm={() =>
					managerToDelete && deleteManager.mutate(managerToDelete.id)
				}
				managerName={managerToDelete?.name || managerToDelete?.email}
				isDeleting={deleteManager.isPending}
			/>
		</div>
	)
}
