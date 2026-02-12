"use client"

import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useMessages } from "@/hooks/useMessages"
import { MessageInput } from "../MessageInput/MessageInput"
import { MessageList } from "../MessageList/MessageList"
import s from "./BookingChat.module.scss"

interface BookingChatProps {
	bookingId: string
	scope?: "tours" | "group-transport" | "charter"
}

export function BookingChat({ bookingId, scope = "tours" }: BookingChatProps) {
	const {
		messages,
		groupedByDate,
		isLoading,
		error,
		sendTextMessage,
		isSending,
		connectionStatus,
	} = useMessages(bookingId, {
		scope,
		refetchInterval: 3000, // Polling каждые 3 секунды
		showToasts: false,
	})

	const statusLabel =
		connectionStatus === "live"
			? "Онлайн"
			: connectionStatus === "connecting"
				? "Подключение..."
				: connectionStatus === "reconnecting"
					? "Переподключение..."
					: "Оффлайн"

	if (isLoading) {
		return (
			<div className={s.container}>
				<div className={s.loading}>
					<LoadingSpinner text="Загрузка сообщений..." />
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className={s.container}>
				<div className={s.error}>
					<ErrorMessage
						title="Ошибка загрузки сообщений"
						message="Не удалось загрузить сообщения. Попробуйте обновить страницу."
						error={error as Error}
					/>
				</div>
			</div>
		)
	}

	return (
		<div className={s.container}>
			<div className={s.header}>
				<div className={s.headerRow}>
					<h3>Чат по бронированию</h3>

					<div className={s.status} data-status={connectionStatus}>
						<span className={s.statusDot} />

						<span className={s.statusText}>{statusLabel}</span>
					</div>
				</div>
			</div>

			<MessageList messages={messages} groupedByDate={groupedByDate} />

			<MessageInput
				onSend={async text => {
					await sendTextMessage(text)
				}}
				isSending={isSending}
			/>
		</div>
	)
}
