"use client"

import { api } from "@/lib/api"
import type { Tour, TourFilters } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useDebounce } from "./useDebounce"

type SortOption = "price" | "rating" | "destination"
type SortOrder = "asc" | "desc"

export type UseToursOptions = {
	initialFilters?: Partial<TourFilters>
	enableAutoFetch?: boolean
}

export function useTours(options: UseToursOptions = {}) {
	const { initialFilters = {}, enableAutoFetch = true } = options

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["tours"],
		queryFn: api.getTours,
		enabled: enableAutoFetch,
	})

	const [searchQuery, setSearchQuery] = useState("")
	const [filters, setFilters] = useState<Partial<TourFilters>>(initialFilters)
	const [sortBy, setSortBy] = useState<SortOption>("rating")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 9

	const debouncedSearch = useDebounce(searchQuery, 300)

	const tours = useMemo(() => data?.items || [], [data])

	const filteredAndSortedTours = useMemo(() => {
		let result = [...tours]

		if (debouncedSearch) {
			const query = debouncedSearch.toLowerCase()

			result = result.filter(
				tour =>
					tour.destination.toLowerCase().includes(query) ||
					tour.shortDescription.toLowerCase().includes(query) ||
					tour.tags.some(tag => tag.toLowerCase().includes(query))
			)
		}

		if (filters.tags && filters.tags.length > 0) {
			result = result.filter(tour =>
				filters.tags!.some(tag => tour.tags.includes(tag))
			)
		}

		if (filters.minPrice !== undefined) {
			result = result.filter(tour => tour.price >= filters.minPrice!)
		}

		if (filters.maxPrice !== undefined) {
			result = result.filter(tour => tour.price <= filters.maxPrice!)
		}

		if (filters.minRating !== undefined) {
			result = result.filter(tour => tour.rating >= filters.minRating!)
		}

		if (filters.search) {
			const searchLower = filters.search.toLowerCase()

			result = result.filter(
				tour =>
					tour.destination.toLowerCase().includes(searchLower) ||
					tour.shortDescription.toLowerCase().includes(searchLower)
			)
		}

		result.sort((a, b) => {
			let compareValue = 0

			switch (sortBy) {
				case "price":
					compareValue = a.price - b.price
					break
				case "rating":
					compareValue = a.rating - b.rating
					break
				case "destination":
					compareValue = a.destination.localeCompare(b.destination)
					break
			}

			return sortOrder === "asc" ? compareValue : -compareValue
		})

		return result
	}, [tours, debouncedSearch, filters, sortBy, sortOrder])

	const totalPages = Math.ceil(filteredAndSortedTours.length / itemsPerPage)

	const paginatedTours = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		const endIndex = startIndex + itemsPerPage

		return filteredAndSortedTours.slice(startIndex, endIndex)
	}, [filteredAndSortedTours, currentPage])

	const getTourById = (id: string): Tour | undefined => {
		return tours.find(tour => tour.id === id)
	}

	const resetFilters = () => {
		setFilters(initialFilters)
		setSearchQuery("")
		setCurrentPage(1)
	}

	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(prev => prev + 1)
		}
	}

	const prevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1)
		}
	}

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			setCurrentPage(page)
		}
	}

	const stats = useMemo(
		() => ({
			total: tours.length,
			filtered: filteredAndSortedTours.length,
			currentPage,
			totalPages,
			hasNextPage: currentPage < totalPages,
			hasPrevPage: currentPage > 1,
		}),
		[tours.length, filteredAndSortedTours.length, currentPage, totalPages]
	)

	const availableTags = useMemo(() => {
		const tags = new Set<string>()

		tours.forEach(tour => {
			tour.tags.forEach(tag => tags.add(tag))
		})

		return Array.from(tags).sort()
	}, [tours])

	const priceRange = useMemo(() => {
		if (tours.length === 0) return { min: 0, max: 0 }

		const prices = tours.map(t => t.price)

		return {
			min: Math.min(...prices),
			max: Math.max(...prices),
		}
	}, [tours])

	return {
		// Данные
		tours,
		filteredTours: filteredAndSortedTours,
		paginatedTours,
		isLoading,
		error,

		// Поиск
		searchQuery,
		setSearchQuery,
		debouncedSearch,

		// Фильтры
		filters,
		setFilters,
		resetFilters,
		availableTags,
		priceRange,

		// Сортировка
		sortBy,
		setSortBy,
		sortOrder,
		setSortOrder,

		// Пагинация
		currentPage,
		totalPages,
		nextPage,
		prevPage,
		goToPage,

		// Утилиты
		getTourById,
		refetch,
		stats,
	}
}
