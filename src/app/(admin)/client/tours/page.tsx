"use client"

import {
	OrdersSection,
	ToursSection,
} from "@/components/pages/ClientToursPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useBookingOrders } from "@/hooks/useBookingOrders"
import { useTours } from "@/hooks/useTours"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ClientToursPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { tours, isLoading: toursLoading } = useTours()
	const ordersQuery = useBookingOrders()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "CLIENT" && session.user.role !== "AGENT") {
			if (session.user.role === "ADMIN") {
				router.push("/manager/tours")
			} else if (session.user.role === "MANAGER") {
				router.push("/manager/tours")
			}

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

	if (
		!session?.user ||
		(session.user.role !== "CLIENT" && session.user.role !== "AGENT")
	) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<OrdersSection
				orders={ordersQuery.data?.items ?? []}
				isLoading={ordersQuery.isLoading}
			/>

			<ToursSection tours={tours} isLoading={toursLoading} />
		</div>
	)
}
