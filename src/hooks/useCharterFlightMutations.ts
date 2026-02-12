"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type {
	CharterFlightCreateInput,
	CharterFlightUpdateInput,
} from "@/lib/validation"
import type { CharterFlight } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateCharterFlight() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: (data: CharterFlightCreateInput) =>
			api.createCharterFlight(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["charterFlightsAdmin"] })
			queryClient.invalidateQueries({ queryKey: ["charterFlightsAll"] })

			showSuccess("Рейс успешно создан")
		},
		onError: (error: Error) => {
			console.error("Ошибка при создании рейса:", error)
			showError(error.message || "Не удалось создать рейс")
		},
	})
}

export function useUpdateCharterFlight() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: CharterFlightUpdateInput
		}) => api.updateCharterFlight(id, data),
		onSuccess: (updated: CharterFlight, variables) => {
			queryClient.invalidateQueries({ queryKey: ["charterFlightsAdmin"] })
			queryClient.invalidateQueries({ queryKey: ["charterFlightsAll"] })
			queryClient.setQueryData<CharterFlight>(
				["charterFlightsAdmin", updated.id],
				updated,
			)
			queryClient.setQueryData<CharterFlight>(
				["charterFlightsAdmin", updated.publicId],
				updated,
			)

			const data = variables?.data as Record<string, unknown> | undefined
			const onlyIsActive =
				data &&
				Object.keys(data).length === 1 &&
				typeof data.isActive === "boolean"

			if (onlyIsActive) {
				showSuccess(updated.isActive ? "Рейс восстановлен" : "Рейс в архиве")
			} else {
				showSuccess("Рейс успешно обновлен")
			}
		},
		onError: (error: Error) => {
			console.error("Ошибка при обновлении рейса:", error)
			showError(error.message || "Не удалось обновить рейс")
		},
	})
}
