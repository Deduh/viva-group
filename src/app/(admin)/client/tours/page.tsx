"use client"

import {
	BookingsSection,
	ToursSection,
} from "@/components/pages/ClientToursPage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { useBookings } from "@/hooks/useBookings"
import { useTours } from "@/hooks/useTours"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import s from "./page.module.scss"

export default function ClientToursPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { tours, isLoading: toursLoading } = useTours()
	const { userBookings, isLoading: bookingsLoading } = useBookings()

	useEffect(() => {
		if (status === "loading") return

		if (!session?.user) {
			router.push("/login")

			return
		}

		if (session.user.role !== "CLIENT") {
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

	if (!session?.user || session.user.role !== "CLIENT") {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Перенаправление..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<BookingsSection bookings={userBookings} isLoading={bookingsLoading} />

			<ToursSection tours={tours} isLoading={toursLoading} />
		</div>
	)
}
