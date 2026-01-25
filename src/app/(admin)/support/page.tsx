"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { Clock3, MessageCircle, Send, ShieldCheck } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function SupportPage() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")
			return
		}
	}, [session, status, router])

	if (status === "loading") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка сессии..." />
			</div>
		)
	}

	if (!session?.user) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<section className={s.hero}>
				<h2>Поддержка команды</h2>

				<p>
					Если что-то сломалось или нужно быстрое изменение — мы на связи в
					телеграме и ватсап. Чатим живыми людьми, без ботов.
				</p>

				<div className={s.meta}>
					<span className={s.pill}>
						<Clock3 /> Ответ: 10:00–19:00 МСК
					</span>

					<span className={s.pill}>
						<ShieldCheck /> Приоритет: продакшн-инциденты
					</span>
				</div>
			</section>

			<div className={s.grid}>
				<div className={s.card}>
					<div className={s.cardHeader}>
						<div className={s.title}>
							<Send size={"1.8rem"} /> Telegram
						</div>
					</div>

					<p className={s.desc}>
						Пишите в чат — отвечаем в течение пары минут. Можно кидать скрины и
						видео.
					</p>

					<ul className={s.infoList}>
						<li>
							@SKusatov <span>· 10:00–19:00 МСК</span>
						</li>

						<li>
							@x1n_x1n <span>· 10:00–19:00 МСК</span>
						</li>

						<li>
							<span>Темы:</span> баги, блокеры, вопросы по админке
						</li>
					</ul>
				</div>

				<div className={s.card}>
					<div className={s.cardHeader}>
						<div className={s.title}>
							<MessageCircle size={"1.8rem"} /> WhatsApp
						</div>
					</div>

					<p className={s.desc}>
						Если нужно решить быстро экстренные ситуации по поводу туров —
						пишите в WhatsApp.
					</p>

					<ul className={s.infoList}>
						<li>
							+7 (777) 565-87-06 <span>· звонки/сообщения</span>
						</li>

						<li>
							+7 (918) 208-92-69 <span>· звонки/сообщения</span>
						</li>

						<li>
							<span>Темы:</span> вопросы по оплатам, срочные статусы
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
