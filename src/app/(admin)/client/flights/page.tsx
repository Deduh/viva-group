"use client"

import {
	BookingsSection,
	FlightsSection,
} from "@/components/pages/ClientCharterPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useCharterBookings } from "@/hooks/useCharterBookings"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ClientCharterPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { bookings, isLoading } = useCharterBookings()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "CLIENT") {
			if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
				router.push("/manager/flights")
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

	if (!session?.user || session.user.role !== "CLIENT") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<BookingsSection bookings={bookings} isLoading={isLoading} />

			<FlightsSection />
		</div>
	)
}
