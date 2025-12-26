"use client"

import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import { isApiError } from "@/lib/errors"
import type {
	Booking,
	BookingStatus,
	CreateBookingInput,
	UpdateBookingInput,
} from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

export type UseBookingsOptions = {
	enableAutoFetch?: boolean
	showToasts?: boolean
}

export function useBookings(options: UseBookingsOptions = {}) {
	const { enableAutoFetch = true, showToasts = true } = options

	const { user } = useAuth()
	const { showSuccess, showError } = useToast()
	const queryClient = useQueryClient()

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["bookings"],
		queryFn: api.getBookings,
		enabled: enableAutoFetch,
	})

	const bookings = useMemo(() => data?.items || [], [data])

	const userBookings = useMemo(() => {
		if (!user) return []

		return bookings.filter(booking => booking.userId === user.id)
	}, [bookings, user])

	const filterByStatus = (status: BookingStatus): Booking[] => {
		return bookings.filter(booking => booking.status === status)
	}

	const stats = useMemo(() => {
		const grouped = bookings.reduce((acc, booking) => {
			acc[booking.status] = (acc[booking.status] || 0) + 1

			return acc
		}, {} as Record<BookingStatus, number>)

		return {
			total: bookings.length,
			pending: grouped.PENDING || 0,
			confirmed: grouped.CONFIRMED || 0,
			cancelled: grouped.CANCELLED || 0,
			inProgress: grouped.IN_PROGRESS || 0,
			completed: grouped.COMPLETED || 0,
			userTotal: userBookings.length,
		}
	}, [bookings, userBookings.length])

	const createBookingMutation = useMutation({
		mutationFn: async (input: CreateBookingInput) => {
			return api.createBooking(input)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			if (showToasts) {
				showSuccess("Бронирование успешно создано!")
			}
		},
		onError: error => {
			if (showToasts) {
				if (isApiError(error) && error.statusCode === 409) {
					showError(
						error.message || "Этот тур временно недоступен для бронирования."
					)
				} else {
					showError(
						error instanceof Error
							? error.message
							: "Ошибка при создании бронирования"
					)
				}
			}
		},
	})

	const updateBookingMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateBookingInput
		}) => {
			return api.updateBooking(id, data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			if (showToasts) {
				showSuccess("Бронирование обновлено!")
			}
		},
		onError: error => {
			if (showToasts) {
				showError(
					error instanceof Error
						? error.message
						: "Ошибка при обновлении бронирования"
				)
			}
		},
	})

	const cancelBookingMutation = useMutation({
		mutationFn: async (id: string) => {
			return api.cancelBooking(id)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			if (showToasts) {
				showSuccess("Бронирование отменено")
			}
		},
		onError: error => {
			if (showToasts) {
				showError(
					error instanceof Error
						? error.message
						: "Ошибка при отмене бронирования"
				)
			}
		},
	})

	const deleteBookingMutation = useMutation({
		mutationFn: async (id: string) => {
			return api.deleteBooking(id)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] })

			if (showToasts) {
				showSuccess("Бронирование удалено")
			}
		},
		onError: error => {
			if (showToasts) {
				showError(
					error instanceof Error
						? error.message
						: "Ошибка при удалении бронирования"
				)
			}
		},
	})

	const getBookingById = (id: string): Booking | undefined => {
		return bookings.find(booking => booking.id === id)
	}

	const canEdit = (booking: Booking): boolean => {
		if (!user) return false

		if (user.role === "ADMIN") return true

		if (user.role === "MANAGER") return true

		return (
			booking.userId === user.id &&
			booking.status !== "COMPLETED" &&
			booking.status !== "CANCELLED"
		)
	}

	const canCancel = (booking: Booking): boolean => {
		if (!user) return false

		if (user.role === "ADMIN") return true

		if (user.role === "MANAGER") return true

		return (
			booking.userId === user.id &&
			(booking.status === "PENDING" || booking.status === "CONFIRMED")
		)
	}

	return {
		bookings,
		userBookings,
		isLoading,
		error,

		createBooking: createBookingMutation.mutateAsync,
		updateBooking: (id: string, data: UpdateBookingInput) =>
			updateBookingMutation.mutateAsync({ id, data }),
		cancelBooking: cancelBookingMutation.mutateAsync,
		deleteBooking: deleteBookingMutation.mutateAsync,

		isCreating: createBookingMutation.isPending,
		isUpdating: updateBookingMutation.isPending,
		isCancelling: cancelBookingMutation.isPending,
		isDeleting: deleteBookingMutation.isPending,

		filterByStatus,
		getBookingById,

		stats,

		canEdit,
		canCancel,

		refetch,
	}
}
