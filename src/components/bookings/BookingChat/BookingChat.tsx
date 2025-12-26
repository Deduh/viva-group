"use client"

import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useMessages } from "@/hooks/useMessages"
import { MessageInput } from "../MessageInput/MessageInput"
import { MessageList } from "../MessageList/MessageList"
import s from "./BookingChat.module.scss"

interface BookingChatProps {
	bookingId: string
	scope?: "tours" | "group-transport"
}

export function BookingChat({ bookingId, scope = "tours" }: BookingChatProps) {
	const {
		messages,
		groupedByDate,
		isLoading,
		error,
		sendTextMessage,
		isSending,
	} = useMessages(bookingId, {
		scope,
		refetchInterval: 3000, // Polling каждые 3 секунды
		showToasts: false,
	})

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
				<h3>Чат по бронированию</h3>
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
