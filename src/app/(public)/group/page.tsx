"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import {
	GroupTransportBenefits,
	GroupTransportHero,
} from "@/components/pages/GroupTransportPage"
import { HomeMailing } from "@/components/pages/HomePage"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary/ErrorBoundary"
import { SectionErrorFallback } from "@/components/ui/ErrorBoundary/SectionErrorFallback"

export default function GroupTransportPage() {
	return (
		<>
			<GroupTransportHero
				title="Group trips"
				subtitle="Групповые перевозки — это единый маршрут для вашей команды, класса, спортивной группы или корпоративного выезда: единый чартер или блок мест, наземный трансфер и координация на каждом этапе."
				season="all"
			/>

			<PublicWrapper>
				<GroupTransportBenefits />

				<ErrorBoundary
					fallback={
						<SectionErrorFallback
							title="Ошибка загрузки рассылки"
							message="Не удалось загрузить форму подписки."
						/>
					}
				>
					<HomeMailing />
				</ErrorBoundary>
			</PublicWrapper>
		</>
	)
}
