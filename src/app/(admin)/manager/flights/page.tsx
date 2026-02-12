"use client"

import { ManagerCharterBookingsSection } from "@/components/pages/ManagerCharterPage"
import { ManagerCharterFlightsSection } from "@/components/pages/ManagerCharterPage/FlightsSection/ManagerCharterFlightsSection"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useCharterBookings } from "@/hooks/useCharterBookings"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ManagerFlightsPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { bookings, isLoading: isBookingsLoading } = useCharterBookings()

	// TODO: Проверить на дубли, вынести в отдельную тулку
	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
			if (session.user.role === "CLIENT") {
				router.push("/client/flights")
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
			<ManagerCharterBookingsSection
				bookings={bookings}
				isBookingsLoading={isBookingsLoading}
			/>

			<ManagerCharterFlightsSection />
		</div>
	)
}
