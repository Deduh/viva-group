"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { Booking } from "@/types"
import type { BookingStatus } from "@/types/enums"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateBookingStatus() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
			api.updateBookingStatus(id, status),
		onSuccess: (updatedBooking: Booking) => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			queryClient.setQueryData<{ items: Booking[] }>(["bookings"], old => {
				if (!old) return { items: [updatedBooking] }
				return {
					items: old.items.map(booking =>
						booking.id === updatedBooking.id ? updatedBooking : booking
					),
				}
			})

			queryClient.setQueryData<Booking>(
				["bookings", updatedBooking.id],
				updatedBooking
			)

			showSuccess("Статус бронирования обновлен!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при обновлении статуса бронирования:", error)
			showError(
				error.message || "Не удалось обновить статус. Попробуйте снова."
			)
		},
	})
}

export function useCancelBooking() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: (id: string) => api.cancelBooking(id),
		onSuccess: (cancelledBooking: Booking) => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			queryClient.setQueryData<{ items: Booking[] }>(["bookings"], old => {
				if (!old) return { items: [cancelledBooking] }
				return {
					items: old.items.map(booking =>
						booking.id === cancelledBooking.id ? cancelledBooking : booking
					),
				}
			})

			queryClient.setQueryData<Booking>(
				["bookings", cancelledBooking.id],
				cancelledBooking
			)

			showSuccess("Бронирование успешно отменено!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при отмене бронирования:", error)
			showError(
				error.message || "Не удалось отменить бронирование. Попробуйте снова."
			)
		},
	})
}
