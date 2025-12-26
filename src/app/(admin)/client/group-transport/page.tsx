"use client"

import {
	BookingsSection,
	ClientGroupTransportForm,
} from "@/components/pages/ClientGroupTransportPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useGroupTransportBookings } from "@/hooks/useGroupTransportBookings"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import styles from "./page.module.scss"

export default function ClientGroupTransportPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { bookings, isLoading: bookingsLoading } = useGroupTransportBookings()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "CLIENT") {
			if (session.user.role === "ADMIN") {
				router.push("/manager/group-transport")
			} else if (session.user.role === "MANAGER") {
				router.push("/manager/group-transport")
			}

			return
		}
	}, [session, status, router])

	if (status === "loading") {
		return (
			<div className={styles.shell}>
				<LoadingSpinner fullScreen text="Загрузка сессии..." />
			</div>
		)
	}

	if (!session?.user || session.user.role !== "CLIENT") {
		return (
			<div className={styles.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={styles.shell}>
			<BookingsSection bookings={bookings} isLoading={bookingsLoading} />

			<ClientGroupTransportForm />
		</div>
	)
}
