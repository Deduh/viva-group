"use client"

import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import { HomeMailing } from "@/components/pages/HomePage"
import { ToursFilters } from "@/components/pages/ToursPage/ToursFilters/ToursFilters"
import { ToursGrid } from "@/components/pages/ToursPage/ToursGrid/ToursGrid"
import { ToursHero } from "@/components/pages/ToursPage/ToursHero/ToursHero"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary/ErrorBoundary"
import { SectionErrorFallback } from "@/components/ui/ErrorBoundary/SectionErrorFallback"
import { Pagination } from "@/components/ui/Pagination/Pagination"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useTours } from "@/hooks/useTours"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLenis } from "lenis/react"
import { useRef } from "react"
import s from "./page.module.scss"

gsap.registerPlugin(ScrollTrigger)

export default function AllToursPage() {
	const containerRef = useRef<HTMLDivElement>(null)
	const { isTransitionComplete } = usePageTransition()
	const lenis = useLenis()

	const scrollToTop = () => {
		if (!containerRef.current || !lenis) return

		lenis.scrollTo(containerRef.current, {
			offset: 0,
			duration: 1.2,
			easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		})
	}

	const {
		paginatedTours,
		isLoading,
		searchQuery,
		setSearchQuery,
		filters,
		setFilters,
		currentPage,
		nextPage: originalNextPage,
		prevPage: originalPrevPage,
		goToPage: originalGoToPage,
		stats,
		availableCategories,
	} = useTours()

	const handleNextPage = () => {
		scrollToTop()
		originalNextPage()
	}

	const handlePrevPage = () => {
		scrollToTop()
		originalPrevPage()
	}

	const handleGoToPage = (page: number) => {
		scrollToTop()
		originalGoToPage(page)
	}

	useGSAP(
		() => {
			if (!containerRef.current || !isTransitionComplete) return

			const filters = containerRef.current.querySelector("[data-tours-filters]")

			if (!filters) return

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top 80%",
					toggleActions: "play none none reverse",
				},
			})

			tl.to(filters, {
				y: 0,
				autoAlpha: 1,
				duration: 0.6,
				ease: "power2.out",
				clearProps: "y",
			})

			return () => {
				if (tl.scrollTrigger) {
					tl.scrollTrigger.kill()
				}

				tl.kill()
			}
		},
		{ scope: containerRef, dependencies: [isTransitionComplete] },
	)

	return (
		<>
			<ToursHero season="all" />

			<PublicWrapper>
				<div ref={containerRef} className={s.wrapper}>
					<ErrorBoundary
						fallback={
							<SectionErrorFallback
								title="Ошибка загрузки фильтров"
								message="Не удалось загрузить фильтры туров."
							/>
						}
					>
						<ToursFilters
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							filters={filters}
							onFiltersChange={setFilters}
							availableCategories={availableCategories}
						/>
					</ErrorBoundary>

					<ErrorBoundary
						fallback={
							<SectionErrorFallback
								title="Ошибка загрузки туров"
								message="Не удалось отобразить список туров. Попробуйте обновить страницу."
							/>
						}
					>
						<ToursGrid tours={paginatedTours} isLoading={isLoading} />
					</ErrorBoundary>

					<ErrorBoundary
						fallback={
							<SectionErrorFallback
								title="Ошибка пагинации"
								message="Не удалось загрузить навигацию по страницам."
							/>
						}
					>
						<Pagination
							currentPage={currentPage}
							totalPages={stats.totalPages}
							onNext={handleNextPage}
							onPrev={handlePrevPage}
							onGoToPage={handleGoToPage}
							hasNextPage={stats.hasNextPage}
							hasPrevPage={stats.hasPrevPage}
						/>
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
				</div>
			</PublicWrapper>
		</>
	)
}
