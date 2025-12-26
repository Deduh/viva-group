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
	availableTags: string[]
}

export function ToursFilters({
	searchQuery,
	onSearchChange,
	filters,
	onFiltersChange,
	availableTags,
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

	const handleTagToggle = (tag: string) => {
		const currentTags = filters.tags || []
		const newTags = currentTags.includes(tag)
			? currentTags.filter(t => t !== tag)
			: [...currentTags, tag]

		onFiltersChange({ ...filters, tags: newTags })
	}

	return (
		<div ref={filtersRef} className={s.filters} data-tours-filters>
			<div className={s.search}>
				<Search className={s.searchIcon} size={20} />

				<div className={s.searchInputWrapper}>
					<Input
						type="text"
						placeholder="Поиск по названию или описанию..."
						value={localSearch}
						onChange={e => setLocalSearch(e.target.value)}
					/>
				</div>
			</div>

			{availableTags.length > 0 && (
				<div className={s.tagsList}>
					{availableTags.map(tag => (
						<button
							key={tag}
							onClick={() => handleTagToggle(tag)}
							className={`${s.tag} ${
								filters.tags?.includes(tag) ? s.active : ""
							}`}
						>
							{tag}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
