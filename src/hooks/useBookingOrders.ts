"use client"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type {
	BookingOrder,
	CreateBookingOrderInput,
	CreateTourCartLeadInput,
	TourCartLead,
} from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useBookingOrders(enabled = true) {
	return useQuery({
		queryKey: ["booking-orders"],
		queryFn: api.getBookingOrders,
		enabled,
	})
}

export function useBookingOrder(id: string, enabled = true) {
	return useQuery({
		queryKey: ["booking-order", id],
		queryFn: () => api.getBookingOrder(id),
		enabled: enabled && Boolean(id),
	})
}

export function useCreateBookingOrder() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation<BookingOrder, Error, CreateBookingOrderInput>({
		mutationFn: api.createBookingOrder,
		onSuccess: order => {
			queryClient.invalidateQueries({ queryKey: ["booking-orders"] })
			queryClient.invalidateQueries({ queryKey: ["bookings"] })
			queryClient.setQueryData(["booking-order", order.publicId], order)
			showSuccess("Заказ по турам отправлен менеджеру.")
		},
		onError: error => {
			showError(error.message || "Не удалось отправить заказ.")
		},
	})
}

export function useTourCartLeads(enabled = true) {
	return useQuery({
		queryKey: ["tour-cart-leads"],
		queryFn: api.getTourCartLeads,
		enabled,
	})
}

export function useTourCartLead(id: string, enabled = true) {
	return useQuery({
		queryKey: ["tour-cart-lead", id],
		queryFn: () => api.getTourCartLead(id),
		enabled: enabled && Boolean(id),
	})
}

export function useCreateTourCartLead() {
	const { showSuccess, showError } = useToast()

	return useMutation<TourCartLead, Error, CreateTourCartLeadInput>({
		mutationFn: api.createTourCartLead,
		onSuccess: lead => {
			showSuccess(`Заявка ${lead.publicId} отправлена.`)
		},
		onError: error => {
			showError(error.message || "Не удалось отправить заявку.")
		},
	})
}

export function useUpdateTourCartLeadStatus() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()

	return useMutation<
		TourCartLead,
		Error,
		{ id: string; status: TourCartLead["status"] }
	>({
		mutationFn: ({ id, status }) => api.updateTourCartLeadStatus(id, status),
		onSuccess: lead => {
			queryClient.invalidateQueries({ queryKey: ["tour-cart-leads"] })
			queryClient.setQueryData(["tour-cart-lead", lead.publicId], lead)
			showSuccess("Статус лида обновлен.")
		},
		onError: error => {
			showError(error.message || "Не удалось обновить статус лида.")
		},
	})
}
