"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import styles from "./page.module.scss"

export default function AccessDeniedPage() {
	const router = useRouter()
	const { user, isAuthenticated } = useAuth()

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.icon}>🔒</div>

				<h1 className={styles.title}>Доступ запрещен</h1>

				<p className={styles.message}>
					У вас недостаточно прав для просмотра этой страницы.
				</p>

				{isAuthenticated && user && (
					<p className={styles.role}>
						Ваша роль: <strong>{user.role}</strong>
					</p>
				)}

				<div className={styles.actions}>
					<button onClick={() => router.back()} className={styles.backButton}>
						← Назад
					</button>

					{isAuthenticated && user && (
						<TransitionLink
							href={
								user.role === "ADMIN"
									? "/manager/tours"
									: user.role === "MANAGER"
									? "/manager/tours"
									: "/client/tours"
							}
							className={styles.dashboardButton}
						>
							Личный кабинет
						</TransitionLink>
					)}
				</div>
			</div>
		</div>
	)
}
