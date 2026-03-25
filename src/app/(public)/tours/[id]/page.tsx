"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { TourInfo } from "@/components/pages/ClientToursPage/TourDetail"
import { TourBookingPanel } from "@/components/tours/TourBookingPanel/TourBookingPanel"
import { BackButton } from "@/components/ui/BackButton/BackButton"
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import s from "./page.module.scss"

export default function PublicTourDetailPage() {
	const params = useParams()
	const tourId = params.id as string

	const tourQuery = useQuery({
		queryKey: ["tours", tourId],
		queryFn: () => api.getTour(tourId),
		enabled: !!tourId,
	})

	return (
		<PublicWrapper>
			<div className={s.shell}>
				<BackButton href="/tours" label="Назад к турам" />

				{tourQuery.isLoading ? (
					<div className={s.state}>
						<LoadingSpinner text="Загрузка тура..." />
					</div>
				) : tourQuery.error ? (
					<div className={s.state}>
						<ErrorMessage
							title="Ошибка загрузки тура"
							message="Не удалось получить информацию о туре."
							error={tourQuery.error as Error}
						/>
					</div>
				) : !tourQuery.data ? (
					<div className={s.state}>
						<ErrorMessage
							title="Тур не найден"
							message="Не удалось найти тур по указанной ссылке."
						/>
					</div>
				) : (
					<div className={s.content}>
						<TourInfo tour={tourQuery.data} />

						<TourBookingPanel tour={tourQuery.data} />
					</div>
				)}
			</div>
		</PublicWrapper>
	)
}
