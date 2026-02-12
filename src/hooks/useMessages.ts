"use client"

import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { ApiCollection, CreateMessageInput, Message } from "@/types"
import { MessageType } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getSession } from "next-auth/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

export type UseMessagesOptions = {
	enableAutoFetch?: boolean
	showToasts?: boolean
	refetchInterval?: number
	scope?: "tours" | "group-transport" | "charter"
}

export function useMessages(
	bookingId: string,
	options: UseMessagesOptions = {},
) {
	const {
		enableAutoFetch = true,
		showToasts = true,
		refetchInterval = false,
		scope = "tours",
	} = options

	const { user, accessToken } = useAuth()
	const { showSuccess, showError } = useToast()
	const queryClient = useQueryClient()
	const isGroupTransport = scope === "group-transport"
	const isCharter = scope === "charter"
	const wsUrl = process.env.NEXT_PUBLIC_WS_URL
	const socketRef = useRef<Socket | null>(null)
	const [isSocketActive, setIsSocketActive] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<
		"offline" | "connecting" | "reconnecting" | "live"
	>("offline")
	const refreshInFlightRef = useRef(false)
	const lastRefreshAtRef = useRef(0)

	const effectiveRefetchInterval = isSocketActive ? false : refetchInterval

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [scope, "messages", bookingId],
		queryFn: () =>
			isGroupTransport
				? api.getGroupTransportMessages(bookingId)
				: isCharter
					? api.getCharterMessages(bookingId)
					: api.getMessages(bookingId),
		enabled: enableAutoFetch && !!bookingId,
		refetchInterval: effectiveRefetchInterval,
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
						input.attachments,
					)
				: isCharter
					? api.createCharterMessage(
							bookingId,
							input.text,
							input.type,
							input.attachments,
						)
					: api.createMessage(
							bookingId,
							input.text,
							input.type,
							input.attachments,
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
						: "Ошибка при отправке сообщения",
				)
			}
		},
	})

	const deleteMessageMutation = useMutation({
		mutationFn: async (messageId: string) => {
			if (isGroupTransport) {
				return api.deleteGroupTransportMessage(bookingId, messageId)
			}

			if (isCharter) {
				throw new Error("Удаление сообщений для авиабилетов пока недоступно")
			}

			return api.deleteMessage(bookingId, messageId)
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
						: "Ошибка при удалении сообщения",
				)
			}
		},
	})

	const markAsReadMutation = useMutation({
		mutationFn: async (messageId: string) => {
			return isGroupTransport
				? api.markGroupTransportMessageRead(bookingId, messageId)
				: isCharter
					? api.markCharterMessageRead(bookingId, messageId)
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
				: isCharter
					? api.markAllCharterMessagesRead(bookingId)
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

	useEffect(() => {
		if (!wsUrl || !accessToken || !bookingId) {
			setConnectionStatus("offline")
			setIsSocketActive(false)

			return
		}

		setConnectionStatus("connecting")

		const socket = io(wsUrl, {
			auth: { token: accessToken },
		})

		socketRef.current = socket

		const joinEvent = isGroupTransport
			? "group-transport:join"
			: isCharter
				? "charter:join"
				: "booking:join"
		const leaveEvent = isGroupTransport
			? "group-transport:leave"
			: isCharter
				? "charter:leave"
				: "booking:leave"
		const messageEvent = isGroupTransport
			? "group-transport:message"
			: isCharter
				? "charter:message"
				: "booking:message"
		const statusEvent = isGroupTransport
			? "group-transport:status"
			: isCharter
				? "charter:status"
				: "booking:status"

		const handleConnect = () => {
			setIsSocketActive(true)
			setConnectionStatus("live")
			socket.emit(joinEvent, { bookingId })
		}

		const handleDisconnect = () => {
			setIsSocketActive(false)
			setConnectionStatus("offline")
		}

		const handleConnectError = (error?: Error) => {
			setIsSocketActive(false)
			setConnectionStatus("offline")

			if (process.env.NODE_ENV === "development" && error) {
				console.warn("[WS] connect_error", error.message)
			}

			if (refreshInFlightRef.current) return

			const now = Date.now()

			if (now - lastRefreshAtRef.current < 5000) return

			lastRefreshAtRef.current = now
			refreshInFlightRef.current = true

			getSession()
				.then(session => {
					const newToken = (session as { accessToken?: string })?.accessToken
					if (!newToken || !socketRef.current) return

					socketRef.current.auth = { token: newToken }
					setConnectionStatus("reconnecting")
					socketRef.current.connect()
				})
				.finally(() => {
					refreshInFlightRef.current = false
				})
		}

		const handleMessage = (incoming: Message) => {
			queryClient.setQueryData<ApiCollection<Message>>(
				[scope, "messages", bookingId],
				old => {
					if (!old) {
						return { items: [incoming], total: 1 }
					}

					const exists = old.items.some(item => item.id === incoming.id)
					const items = exists
						? old.items.map(item => (item.id === incoming.id ? incoming : item))
						: [...old.items, incoming]

					return {
						...old,
						items,
						total:
							typeof old.total === "number"
								? old.total + (exists ? 0 : 1)
								: old.total,
					}
				},
			)
		}

		const handleStatus = () => {
			queryClient.invalidateQueries({
				queryKey: [
					isGroupTransport
						? "groupTransportBookings"
						: isCharter
							? "charterBookings"
							: "bookings",
				],
			})
		}

		socket.on("connect", handleConnect)
		socket.on("disconnect", handleDisconnect)
		socket.on("connect_error", handleConnectError)
		socket.on(messageEvent, handleMessage)
		socket.on(statusEvent, handleStatus)

		return () => {
			socket.emit(leaveEvent, { bookingId })
			socket.off("connect", handleConnect)
			socket.off("disconnect", handleDisconnect)
			socket.off("connect_error", handleConnectError)
			socket.off(messageEvent, handleMessage)
			socket.off(statusEvent, handleStatus)
			socket.disconnect()
			socketRef.current = null
			setIsSocketActive(false)
			setConnectionStatus("offline")
		}
	}, [
		wsUrl,
		accessToken,
		bookingId,
		isGroupTransport,
		isCharter,
		scope,
		queryClient,
	])

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
		connectionStatus,
	}
}
