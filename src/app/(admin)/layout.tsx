"use client"

import { AdminSidebar } from "@/components/layout/AdminLayout/AdminSidebar/AdminSidebar"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./layout.module.scss"

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/login")
		}
	}, [user, isLoading, router])

	if (isLoading) {
		return (
			<div className={s.loading}>
				<LoadingSpinner fullScreen text="Загрузка..." />
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<div className={s.layout}>
			<AdminSidebar />

			<main className={s.main}>{children}</main>
		</div>
	)
}
