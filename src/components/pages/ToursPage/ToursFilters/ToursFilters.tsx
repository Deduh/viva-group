"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { useDebounce } from "@/hooks/useDebounce"
import type { TourFilters } from "@/types"
import gsap from "gsap"
import { Search } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import s from "./ToursFilters.module.scss"

interface ToursFiltersProps {
	searchQuery: string
	onSearchChange: (query: string) => void
	filters: Partial<TourFilters>
	onFiltersChange: (filters: Partial<TourFilters>) => void
	availableCategories: string[]
}

export function ToursFilters({
	searchQuery,
	onSearchChange,
	filters,
	onFiltersChange,
	availableCategories,
}: ToursFiltersProps) {
	const filtersRef = useRef<HTMLDivElement>(null)
	const [localSearch, setLocalSearch] = useState(searchQuery)
	const debouncedSearch = useDebounce(localSearch, 300)

	useLayoutEffect(() => {
		const filters = filtersRef.current

		if (filters) {
			gsap.set(filters, { y: 40, autoAlpha: 0 })
		}

		return () => {
			if (filters) {
				gsap.set(filters, { clearProps: "all" })
			}
		}
	}, [])

	useEffect(() => {
		onSearchChange(debouncedSearch)
	}, [debouncedSearch, onSearchChange])

	const handleCategoryToggle = (category: string) => {
		const currentCategories = filters.categories || []
		const newCategories = currentCategories.includes(category)
			? currentCategories.filter(item => item !== category)
			: [...currentCategories, category]

		onFiltersChange({ ...filters, categories: newCategories })
	}

	return (
		<div ref={filtersRef} className={s.filters} data-tours-filters>
			<div className={s.search}>
				<Search className={s.searchIcon} size={"2rem"} />

				<div className={s.searchInputWrapper}>
					<Input
						type="text"
						placeholder="Поиск по названию или описанию..."
						value={localSearch}
						onChange={e => setLocalSearch(e.target.value)}
					/>
				</div>
			</div>

			{availableCategories.length > 0 && (
				<div className={s.tagsList}>
					{availableCategories.map(category => (
						<button
							key={category}
							onClick={() => handleCategoryToggle(category)}
							className={`${s.tag} ${
								filters.categories?.includes(category) ? s.active : ""
							}`}
						>
							{category}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
