"use client"

import { ManagerGroupTransportBookingsSection } from "@/components/pages/ManagerGroupTransportPage/BookingsSection/ManagerGroupTransportBookingsSection"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useGroupTransportBookings } from "@/hooks/useGroupTransportBookings"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ManagerGroupTransportPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { bookings, isLoading: bookingsLoading } = useGroupTransportBookings()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
			if (session.user.role === "CLIENT") {
				router.push("/client/group-transport")
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
			<ManagerGroupTransportBookingsSection
				bookings={bookings}
				isLoading={bookingsLoading}
			/>
		</div>
	)
}
