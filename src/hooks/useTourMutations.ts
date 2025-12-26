"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { isApiError } from "@/lib/errors"
import type { TourCreateInput, TourUpdateInput } from "@/lib/validation"
import type { Tour } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateTour() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: (data: TourCreateInput) => api.createTour(data),
		onSuccess: (newTour: Tour) => {
			queryClient.invalidateQueries({ queryKey: ["tours"] })

			queryClient.setQueryData<{ items: Tour[] }>(["tours"], old => {
				if (!old) return { items: [newTour] }
				return { items: [...old.items, newTour] }
			})

			showSuccess("Тур успешно создан!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при создании тура:", error)
			showError(error.message || "Не удалось создать тур. Попробуйте снова.")
		},
	})
}

export function useUpdateTour() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TourUpdateInput }) =>
			api.updateTour(id, data),
		onSuccess: (updatedTour: Tour) => {
			queryClient.invalidateQueries({ queryKey: ["tours"] })

			queryClient.setQueryData<{ items: Tour[] }>(["tours"], old => {
				if (!old) return { items: [updatedTour] }
				return {
					items: old.items.map(tour =>
						tour.id === updatedTour.id ? updatedTour : tour
					),
				}
			})

			queryClient.setQueryData<Tour>(["tours", updatedTour.id], updatedTour)

			showSuccess("Тур успешно обновлен!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при обновлении тура:", error)
			showError(error.message || "Не удалось обновить тур. Попробуйте снова.")
		},
	})
}

export function useDeleteTour() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: (id: string) => api.deleteTour(id),
		onSuccess: (_, deletedId) => {
			queryClient.invalidateQueries({ queryKey: ["tours"] })

			queryClient.setQueryData<{ items: Tour[] }>(["tours"], old => {
				if (!old) return { items: [] }
				return {
					items: old.items.filter(tour => tour.id !== deletedId),
				}
			})

			queryClient.removeQueries({ queryKey: ["tours", deletedId] })

			showSuccess("Тур успешно удален!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при удалении тура:", error)
			if (isApiError(error) && error.statusCode === 409) {
				showError(
					error.message || "Нельзя удалить тур: есть активные бронирования."
				)
				return
			}

			showError(error.message || "Не удалось удалить тур. Попробуйте снова.")
		},
	})
}
