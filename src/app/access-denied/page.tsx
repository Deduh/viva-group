"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import s from "./page.module.scss"

export default function AccessDeniedPage() {
	const { user, isAuthenticated } = useAuth()

	return (
		<div className={s.container}>
			<div className={s.background} aria-hidden="true">
				<span className={s.orb} />
				<span className={s.orbSecondary} />
				<span className={s.grid} />
			</div>

			<div className={s.content}>
				<div className={s.icon}>🔒</div>

				<h1 className={s.title}>Доступ запрещен</h1>

				<p className={s.message}>
					У вас недостаточно прав для просмотра этой страницы.
				</p>

				{isAuthenticated && user && (
					<p className={s.role}>
						Ваша роль: <strong>{user.role}</strong>
					</p>
				)}

				<div className={s.actions}>
					<TransitionLink href="/" className={s.backButton}>
						← На главную
					</TransitionLink>

					{isAuthenticated && user && (
						<TransitionLink
							href={
								user.role === "ADMIN"
									? "/manager/tours"
									: user.role === "MANAGER"
										? "/manager/tours"
										: "/client/tours"
							}
							className={s.dashboardButton}
						>
							Личный кабинет
						</TransitionLink>
					)}
				</div>
			</div>
		</div>
	)
}
