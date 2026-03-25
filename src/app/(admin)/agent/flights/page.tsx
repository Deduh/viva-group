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

export default function AgentCharterPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { bookings, isLoading } = useCharterBookings()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "AGENT") {
			if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
				router.push("/manager/flights")
			} else {
				router.push("/client/flights")
			}
		}
	}, [session, status, router])

	if (status === "loading") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Загрузка сессии..." />
			</div>
		)
	}

	if (!session?.user || session.user.role !== "AGENT") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<BookingsSection bookings={bookings} isLoading={isLoading} />
			<FlightsSection mode="agent" />
		</div>
	)
}
