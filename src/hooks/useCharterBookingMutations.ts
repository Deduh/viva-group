"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { CharterBooking } from "@/types"
import type { BookingStatus } from "@/types/enums"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateCharterBookingStatus() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
			api.updateCharterBookingStatus(id, status),
		onSuccess: (updated: CharterBooking) => {
			queryClient.invalidateQueries({ queryKey: ["charterBookings"] })

			queryClient.setQueryData<{ items: CharterBooking[] }>(
				["charterBookings"],
				old => {
					if (!old) return { items: [updated] }
					return {
						items: old.items.map(b => (b.id === updated.id ? updated : b)),
					}
				},
			)

			queryClient.setQueryData<CharterBooking>(
				["charterBookings", updated.id],
				updated,
			)
			queryClient.setQueryData<CharterBooking>(
				["charterBookings", updated.publicId],
				updated,
			)

			showSuccess("Статус заявки обновлен!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при обновлении статуса заявки:", error)
			showError(
				error.message || "Не удалось обновить статус. Попробуйте снова.",
			)
		},
	})
}
