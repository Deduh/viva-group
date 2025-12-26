"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { BookingStatus } from "@/types/enums"
import type { GroupTransportBooking } from "@/types/group-transport"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateGroupTransportBookingStatus() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: string
			status: GroupTransportBooking["status"]
		}) => api.updateGroupTransportBookingStatus(id, status),
		onSuccess: (updatedBooking: GroupTransportBooking) => {
			queryClient.invalidateQueries({
				queryKey: ["groupTransportBookings"],
			})

			queryClient.setQueryData<{ items: GroupTransportBooking[] }>(
				["groupTransportBookings"],
				old => {
					if (!old) return { items: [updatedBooking] }
					return {
						items: old.items.map(booking =>
							booking.id === updatedBooking.id ? updatedBooking : booking
						),
					}
				}
			)

			queryClient.setQueryData<GroupTransportBooking>(
				["groupTransportBookings", updatedBooking.id],
				updatedBooking
			)

			showSuccess("Статус перевозки обновлен!")
		},
		onError: (error: Error) => {
			console.error("Ошибка при обновлении статуса перевозки:", error)
			showError(
				error.message || "Не удалось обновить статус. Попробуйте снова."
			)
		},
	})
}

export function useCancelGroupTransportBooking() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation({
		mutationFn: (id: string) =>
			api.updateGroupTransportBookingStatus(id, BookingStatus.CANCELLED),
		onSuccess: (updatedBooking: GroupTransportBooking) => {
			queryClient.invalidateQueries({
				queryKey: ["groupTransportBookings"],
			})

			queryClient.setQueryData<{ items: GroupTransportBooking[] }>(
				["groupTransportBookings"],
				old => {
					if (!old) return { items: [updatedBooking] }
					return {
						items: old.items.map(booking =>
							booking.id === updatedBooking.id ? updatedBooking : booking
						),
					}
				}
			)

			queryClient.setQueryData<GroupTransportBooking>(
				["groupTransportBookings", updatedBooking.id],
				updatedBooking
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
