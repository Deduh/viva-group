"use client"

import { ManagerBookingsSection } from "@/components/pages/ManagerToursPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useBookingOrders, useTourCartLeads } from "@/hooks/useBookingOrders"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

	export default function ManagerToursPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const ordersQuery = useBookingOrders(true)
	const leadsQuery = useTourCartLeads(true)

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
			if (session.user.role === "CLIENT") {
				router.push("/client/tours")
			} else {
				router.push("/login")
			}
		}
	}, [session, status, router])

	if (status === "loading") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Проверка прав доступа..." />
			</div>
		)
	}

	if (
		!session?.user ||
		(session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
	) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<ManagerBookingsSection
				orders={ordersQuery.data?.items ?? []}
				leads={leadsQuery.data?.items ?? []}
				isLoading={ordersQuery.isLoading}
				leadsLoading={leadsQuery.isLoading}
			/>
		</div>
	)
}
