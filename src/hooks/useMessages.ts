"use client"

import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { CreateMessageInput, Message } from "@/types"
import { MessageType } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

export type UseMessagesOptions = {
	enableAutoFetch?: boolean
	showToasts?: boolean
	refetchInterval?: number
	scope?: "tours" | "group-transport"
}

export function useMessages(
	bookingId: string,
	options: UseMessagesOptions = {}
) {
	const {
		enableAutoFetch = true,
		showToasts = true,
		refetchInterval = false,
		scope = "tours",
	} = options

	const { user } = useAuth()
	const { showSuccess, showError } = useToast()
	const queryClient = useQueryClient()
	const isGroupTransport = scope === "group-transport"

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [scope, "messages", bookingId],
		queryFn: () =>
			isGroupTransport
				? api.getGroupTransportMessages(bookingId)
				: api.getMessages(bookingId),
		enabled: enableAutoFetch && !!bookingId,
		refetchInterval,
	})

	const messages = useMemo(() => data?.items || [], [data])

	const groupedByDate = useMemo(() => {
		const grouped = new Map<string, Message[]>()

		messages.forEach(message => {
			const date = new Date(message.createdAt).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})

			if (!grouped.has(date)) {
				grouped.set(date, [])
			}

			grouped.get(date)!.push(message)
		})

		return grouped
	}, [messages])

	const unreadCount = useMemo(() => {
		if (!user) return 0

		return messages.filter(msg => {
			const readByMe =
				typeof msg.readByMe === "boolean" ? msg.readByMe : msg.isRead

			return !readByMe && msg.authorId !== user.id
		}).length
	}, [messages, user])

	const lastMessage = useMemo(() => {
		return messages.length > 0 ? messages[messages.length - 1] : null
	}, [messages])

	const sendMessageMutation = useMutation({
		mutationFn: async (input: Omit<CreateMessageInput, "bookingId">) => {
			if (!user) {
				throw new Error("Пользователь не авторизован")
			}

			return isGroupTransport
				? api.createGroupTransportMessage(
						bookingId,
						input.text,
						input.type,
						input.attachments
				  )
				: api.createMessage(
						bookingId,
						input.text,
						input.type,
						input.attachments
				  )
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [scope, "messages", bookingId],
			})

			if (showToasts) {
				showSuccess("Сообщение отправлено")
			}
		},
		onError: error => {
			if (showToasts) {
				showError(
					error instanceof Error
						? error.message
						: "Ошибка при отправке сообщения"
				)
			}
		},
	})

	const deleteMessageMutation = useMutation({
		mutationFn: async (messageId: string) => {
			return isGroupTransport
				? api.deleteGroupTransportMessage(bookingId, messageId)
				: api.deleteMessage(bookingId, messageId)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [scope, "messages", bookingId],
			})

			if (showToasts) {
				showSuccess("Сообщение удалено")
			}
		},
		onError: error => {
			if (showToasts) {
				showError(
					error instanceof Error
						? error.message
						: "Ошибка при удалении сообщения"
				)
			}
		},
	})

	const markAsReadMutation = useMutation({
		mutationFn: async (messageId: string) => {
			return isGroupTransport
				? api.markGroupTransportMessageRead(bookingId, messageId)
				: api.markMessageRead(bookingId, messageId)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [scope, "messages", bookingId],
			})
		},
		onError: error => {
			console.error("Ошибка при отметке сообщения:", error)
		},
	})

	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			return isGroupTransport
				? api.markAllGroupTransportMessagesRead(bookingId)
				: api.markAllMessagesRead(bookingId)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [scope, "messages", bookingId],
			})
		},
		onError: error => {
			console.error("Ошибка при отметке сообщений:", error)
		},
	})

	const sendTextMessage = async (text: string) => {
		return sendMessageMutation.mutateAsync({
			text,
			type: MessageType.TEXT,
		})
	}

	const sendFileMessage = async (text: string) => {
		// TODO: Добавить attachments параметр когда будет бэкенд
		return sendMessageMutation.mutateAsync({
			text,
			type: MessageType.FILE,
		})
	}

	const isOwnMessage = (message: Message): boolean => {
		if (!user) return false

		return message.authorId === user.id
	}

	const filterByType = (type: MessageType): Message[] => {
		return messages.filter(msg => msg.type === type)
	}

	return {
		messages,
		groupedByDate,
		isLoading,
		error,

		unreadCount,
		lastMessage,

		sendMessage: sendMessageMutation.mutateAsync,
		sendTextMessage,
		sendFileMessage,
		deleteMessage: deleteMessageMutation.mutateAsync,

		markAsRead: markAsReadMutation.mutateAsync,
		markAllAsRead: markAllAsReadMutation.mutateAsync,

		isSending: sendMessageMutation.isPending,
		isDeleting: deleteMessageMutation.isPending,

		isOwnMessage,
		filterByType,
		refetch,
	}
}
