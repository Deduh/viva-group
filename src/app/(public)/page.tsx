import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import {
	HomeAdvantages,
	HomeIntro,
	HomeMailing,
	HomeTours,
} from "@/components/pages/HomePage"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary/ErrorBoundary"
import { SectionErrorFallback } from "@/components/ui/ErrorBoundary/SectionErrorFallback"

export default async function Home() {
	return (
		<div>
			<HomeIntro />

			<PublicWrapper>
				<ErrorBoundary
					fallback={
						<SectionErrorFallback
							title="Ошибка загрузки туров"
							message="Не удалось загрузить раздел с турами."
						/>
					}
				>
					<HomeTours />
				</ErrorBoundary>

				<ErrorBoundary
					fallback={
						<SectionErrorFallback
							title="Ошибка загрузки преимуществ"
							message="Не удалось загрузить раздел с преимуществами."
						/>
					}
				>
					<HomeAdvantages />
				</ErrorBoundary>

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
		</div>
	)
}
