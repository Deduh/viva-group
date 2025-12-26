"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { memo } from "react"
import s from "./Pagination.module.scss"

interface PaginationProps {
	currentPage: number
	totalPages: number
	onNext: () => void
	onPrev: () => void
	onGoToPage: (page: number) => void
	hasNextPage: boolean
	hasPrevPage: boolean
}

export const Pagination = memo(function Pagination({
	currentPage,
	totalPages,
	onNext,
	onPrev,
	onGoToPage,
	hasNextPage,
	hasPrevPage,
}: PaginationProps) {
	if (totalPages <= 1) return null

	const getPageNumbers = () => {
		const pages: (number | string)[] = []
		const showPages = 5

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i)
				}

				pages.push("...")
				pages.push(totalPages)
			} else if (currentPage >= totalPages - 2) {
				pages.push(1)
				pages.push("...")

				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i)
				}
			} else {
				pages.push(1)
				pages.push("...")

				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i)
				}

				pages.push("...")
				pages.push(totalPages)
			}
		}

		return pages
	}

	return (
		<div className={s.pagination}>
			<button
				onClick={onPrev}
				disabled={!hasPrevPage}
				className={s.button}
				aria-label="Предыдущая страница"
			>
				<ChevronLeft size={20} />

				<span>Назад</span>
			</button>

			<div className={s.pages}>
				{getPageNumbers().map((page, index) => (
					<button
						key={index}
						onClick={() => {
							if (typeof page === "number" && page !== currentPage) {
								onGoToPage(page)
							}
						}}
						disabled={page === "..." || page === currentPage}
						className={`${s.page} ${page === currentPage ? s.active : ""} ${
							page === "..." ? s.dots : ""
						}`}
					>
						{page}
					</button>
				))}
			</div>

			<button
				onClick={onNext}
				disabled={!hasNextPage}
				className={s.button}
				aria-label="Следующая страница"
			>
				<span>Вперед</span>

				<ChevronRight size={20} />
			</button>
		</div>
	)
})
