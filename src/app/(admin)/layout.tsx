"use client"

import { AdminSidebar } from "@/components/layout/AdminLayout/AdminSidebar/AdminSidebar"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import s from "./layout.module.scss"

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, isLoading } = useAuth()
	const { update } = useSession()
	const router = useRouter()
	const roleRefreshRequestedRef = useRef(false)

	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/login")
		}
	}, [user, isLoading, router])

	useEffect(() => {
		if (isLoading || !user) return
		if (roleRefreshRequestedRef.current) return
		if (user.role !== "CLIENT" && user.role !== "AGENT") return

		roleRefreshRequestedRef.current = true
		void update()
	}, [isLoading, update, user])

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
