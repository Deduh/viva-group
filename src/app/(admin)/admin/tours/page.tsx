"use client"

import {
	AdminToursSection,
	TourDeleteConfirm,
	TourFormModal,
} from "@/components/pages/AdminPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Modal } from "@/components/ui/Modal/Modal"
import { useAuth } from "@/hooks/useAuth"
import {
	useCreateTour,
	useDeleteTour,
	useUpdateTour,
} from "@/hooks/useTourMutations"
import { api } from "@/lib/api"
import type { TourCreateInput, TourUpdateInput } from "@/lib/validation"
import type { Tour } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import s from "./page.module.scss"

export default function AdminToursPage() {
	const { user, isLoading, requireRole } = useAuth()

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [editingTourId, setEditingTourId] = useState<string | null>(null)
	const [deletingTour, setDeletingTour] = useState<Tour | null>(null)

	const toursQuery = useQuery({
		queryKey: ["tours", "admin"],
		queryFn: api.getToursAdmin,
	})
	const editingTourQuery = useQuery({
		queryKey: ["tour", "admin", editingTourId],
		queryFn: () => api.getTourAdmin(editingTourId as string),
		enabled: !!editingTourId,
	})

	const createTourMutation = useCreateTour()
	const updateTourMutation = useUpdateTour()
	const deleteTourMutation = useDeleteTour()

	useEffect(() => {
		requireRole("ADMIN")
	}, [requireRole])

	const handleCreateSubmit = async (data: TourCreateInput) => {
		await createTourMutation.mutateAsync(data)
	}

	const handleUpdateSubmit = async (data: TourUpdateInput) => {
		if (!editingTourId) return

		await updateTourMutation.mutateAsync({
			id: editingTourId,
			data,
		})

		setEditingTourId(null)
	}

	const handleDeleteConfirm = async () => {
		if (!deletingTour) return

		await deleteTourMutation.mutateAsync(deletingTour.id)

		setDeletingTour(null)
	}

	const handleEdit = (tour: Tour) => {
		setEditingTourId(tour.id)
	}

	const handleDelete = (tour: Tour) => {
		setDeletingTour(tour)
	}

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
			<AdminToursSection
				tours={toursQuery.data?.items || []}
				isLoading={toursQuery.isLoading}
				onAdd={() => setIsCreateModalOpen(true)}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			{isCreateModalOpen && (
				<TourFormModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
					onSubmit={handleCreateSubmit}
				/>
			)}

			{editingTourId &&
				(editingTourQuery.data ? (
					<TourFormModal
						isOpen={!!editingTourId}
						onClose={() => setEditingTourId(null)}
						tour={editingTourQuery.data}
						onSubmit={handleUpdateSubmit}
					/>
				) : (
					<Modal
						isOpen={!!editingTourId}
						onClose={() => setEditingTourId(null)}
						title="Редактировать тур"
						size="large"
					>
						<LoadingSpinner text="Загружаем данные тура..." />
					</Modal>
				))}

			<TourDeleteConfirm
				isOpen={!!deletingTour}
				onClose={() => setDeletingTour(null)}
				tour={deletingTour}
				onConfirm={handleDeleteConfirm}
				isDeleting={deleteTourMutation.isPending}
			/>
		</div>
	)
}
