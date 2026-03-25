"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import {
	AGENT_APPLICATION_PATH,
	getRoleFallbackPath,
} from "@/lib/auth-redirect"
import s from "./page.module.scss"

export default function ForAgentsPage() {
	const { user, isAuthenticated } = useAuth()
	const registerHref = `/register?callbackUrl=${encodeURIComponent(AGENT_APPLICATION_PATH)}`
	const loginHref = `/login?callbackUrl=${encodeURIComponent(AGENT_APPLICATION_PATH)}`

	return (
		<PublicWrapper>
			<div className={s.page}>
				<section className={s.hero}>
					<div className={s.heroContent}>
						<span className={s.eyebrow}>Для турагентов</span>
						<h1 className={s.title}>Агентский доступ Viva Group</h1>
						<p className={s.text}>
							После одобрения заявки вы получите отдельный чартерный кабинет с
							агентскими тарифами и отображением комиссии.
						</p>
					</div>
				</section>

				{!isAuthenticated ? (
					<section className={s.card}>
						<h2 className={s.cardTitle}>Сначала войдите в аккаунт</h2>
						<p className={s.cardText}>
							Сначала зарегистрируйтесь как обычный клиент или войдите в уже
							существующий аккаунт. После этого откроется отдельная форма
							заявки в личном кабинете.
						</p>

						<div className={s.actions}>
							<TransitionLink href={registerHref} className={s.primaryButton}>
								Создать аккаунт
							</TransitionLink>
							<TransitionLink href={loginHref} className={s.secondaryButton}>
								Войти
							</TransitionLink>
						</div>
					</section>
				) : user?.role === "AGENT" ? (
					<section className={s.card}>
						<h2 className={s.cardTitle}>Доступ уже активен</h2>
						<p className={s.cardText}>
							Ваш аккаунт уже переведен в режим турагента. Можно открыть
							агентский раздел чартеров и работать с тарифами.
						</p>

						<TransitionLink href="/agent/flights" className={s.primaryButton}>
							Открыть агентский кабинет
						</TransitionLink>
					</section>
				) : user?.role !== "CLIENT" ? (
					<section className={s.card}>
						<h2 className={s.cardTitle}>Текущий аккаунт уже не клиентский</h2>
						<p className={s.cardText}>
							Подача агентской заявки доступна только из обычного клиентского
							кабинета. Для вашей текущей роли используется другой рабочий
							раздел.
						</p>

						<TransitionLink
							href={getRoleFallbackPath(user?.role)}
							className={s.primaryButton}
						>
							Открыть свой кабинет
						</TransitionLink>
					</section>
				) : (
					<section className={s.card}>
						<div className={s.cardHeader}>
							<h2 className={s.cardTitle}>Подать заявку из кабинета клиента</h2>
							<p className={s.cardText}>
								Аккаунт уже создан. Теперь заполните форму агентской заявки в
								личном кабинете: так одобренный статус будет привязан именно к
								вашему профилю.
							</p>
						</div>

						<div className={s.actions}>
							<TransitionLink
								href={AGENT_APPLICATION_PATH}
								className={s.primaryButton}
							>
								Открыть форму заявки
							</TransitionLink>
						</div>
					</section>
				)}
			</div>
		</PublicWrapper>
	)
}
