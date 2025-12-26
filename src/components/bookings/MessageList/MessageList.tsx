"use client"

import { useAuth } from "@/hooks/useAuth"
import { formatTime } from "@/lib/format"
import type { Message } from "@/types"
import { useEffect, useRef } from "react"
import s from "./MessageList.module.scss"

interface MessageListProps {
	messages: Message[]
	groupedByDate: Map<string, Message[]>
}

export function MessageList({ messages, groupedByDate }: MessageListProps) {
	const { user } = useAuth()
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const isOwnMessage = (message: Message): boolean => {
		if (!user) return false

		return message.authorId === user.id
	}

	const isMessageRead = (message: Message): boolean => {
		if (typeof message.readByMe === "boolean") {
			return message.readByMe
		}

		return !!message.isRead
	}

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "smooth",
			})
		} else {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
		}
	}, [messages])

	if (messages.length === 0) {
		return (
			<div className={s.empty}>
				<p>Пока нет сообщений</p>

				<p className={s.emptyHint}>
					Начните общение, отправив первое сообщение
				</p>
			</div>
		)
	}

	return (
		<div
			className={s.container}
			data-lenis-prevent
			onWheel={e => e.stopPropagation()}
			onTouchMove={e => e.stopPropagation()}
			ref={containerRef}
		>
			<div className={s.inner}>
				{Array.from(groupedByDate.entries()).map(([date, dateMessages]) => (
					<div key={date} className={s.dateGroup}>
						<div className={s.dateSeparator}>
							<span>{date}</span>
						</div>

						{dateMessages.map(message => {
							const isOwn = isOwnMessage(message)

							return (
								<div
									key={message.id}
									className={`${s.message} ${isOwn ? s.own : s.other}`}
								>
									<div className={s.messageContent}>
										{!isOwn && (
											<div className={s.authorName}>
												{message.authorName || "Пользователь"}
											</div>
										)}
										<div className={s.messageBubble}>
											<p className={s.messageText}>{message.text}</p>
											<div className={s.messageMeta}>
												<span className={s.messageTime}>
													{formatTime(message.createdAt)}
												</span>
												{isOwn && (
													<span className={s.messageStatus}>
														{isMessageRead(message) ? "✓✓" : "✓"}
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				))}

				<div ref={messagesEndRef} />
			</div>
		</div>
	)
}
