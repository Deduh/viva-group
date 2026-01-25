"use client"

import { Send } from "lucide-react"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import s from "./MessageInput.module.scss"

interface MessageInputProps {
	onSend: (text: string) => Promise<void>
	isSending?: boolean
	disabled?: boolean
}

export function MessageInput({
	onSend,
	isSending = false,
	disabled = false,
}: MessageInputProps) {
	const [text, setText] = useState("")
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current

		if (!textarea) return

		textarea.style.height = "auto"
		const scrollHeight = textarea.scrollHeight
		const maxHeight = 12 * 10
		textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
	}

	useEffect(() => {
		adjustTextareaHeight()
	}, [text])

	const handleSend = async () => {
		const trimmedText = text.trim()
		if (!trimmedText || isSending || disabled) return

		await onSend(trimmedText)
		setText("")

		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
		}
	}

	const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<div className={s.container}>
			<div className={s.inputWrapper}>
				<textarea
					ref={textareaRef}
					value={text}
					onChange={e => setText(e.target.value)}
					onKeyDown={handleKeyPress}
					placeholder="Введите сообщение..."
					className={s.input}
					disabled={isSending || disabled}
					rows={1}
				/>

				<button
					type="button"
					onClick={handleSend}
					disabled={!text.trim() || isSending || disabled}
					className={s.sendButton}
					aria-label="Отправить сообщение"
				>
					<Send size={"2rem"} />
				</button>
			</div>

			<div className={s.hint}>
				Нажмите Enter для отправки, Shift+Enter для новой строки
			</div>
		</div>
	)
}
