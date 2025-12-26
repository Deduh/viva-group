"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import {
	ContactForm,
	ContactInfoList,
	ContactsHero,
} from "@/components/pages/ContactsPage"
import { HomeMailing } from "@/components/pages/HomePage/"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary/ErrorBoundary"
import { SectionErrorFallback } from "@/components/ui/ErrorBoundary/SectionErrorFallback"

export default function ContactsPage() {
	return (
		<>
			<ContactsHero />

			<PublicWrapper>
				<ContactInfoList />

				<ContactForm />

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
