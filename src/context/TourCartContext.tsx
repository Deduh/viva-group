"use client"

import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react"

const STORAGE_KEY = "viva-tour-cart:v1"

export type TourCartItem = {
	id: string
	tourId: string
	tourPublicId?: string
	participantsCount: number
	note?: string
	addedAt: string
}

type AddTourCartItemInput = {
	tourId: string
	tourPublicId?: string
	participantsCount?: number
	note?: string
}

type TourCartContextValue = {
	items: TourCartItem[]
	itemsCount: number
	totalParticipants: number
	isHydrated: boolean
	addItem: (input: AddTourCartItemInput) => void
	updateItem: (id: string, patch: Partial<Omit<TourCartItem, "id" | "addedAt">>) => void
	removeItem: (id: string) => void
	clearCart: () => void
}

const TourCartContext = createContext<TourCartContextValue | null>(null)

const createId = () => {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID()
	}

	return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function TourCartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<TourCartItem[]>([])
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return

		try {
			const raw = window.localStorage.getItem(STORAGE_KEY)

			if (!raw) {
				setIsHydrated(true)
				return
			}

			const parsed = JSON.parse(raw) as TourCartItem[]
			if (Array.isArray(parsed)) {
				setItems(
					parsed.filter(item => item && typeof item.tourId === "string"),
				)
			}
		} catch {
			window.localStorage.removeItem(STORAGE_KEY)
		} finally {
			setIsHydrated(true)
		}
	}, [])

	useEffect(() => {
		if (!isHydrated || typeof window === "undefined") return

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
	}, [isHydrated, items])

	const value = useMemo<TourCartContextValue>(() => {
		return {
			items,
			itemsCount: items.length,
			totalParticipants: items.reduce(
				(sum, item) => sum + item.participantsCount,
				0,
			),
			isHydrated,
			addItem: input => {
				setItems(current => {
					return [
						...current,
						{
							id: createId(),
							tourId: input.tourId,
							tourPublicId: input.tourPublicId,
							participantsCount: Math.max(1, input.participantsCount ?? 1),
							note: input.note?.trim() || undefined,
							addedAt: new Date().toISOString(),
						},
					]
				})
			},
			updateItem: (id, patch) => {
				setItems(current =>
					current.map(item =>
						item.id === id
							? {
									...item,
									...patch,
									participantsCount: Math.max(
										1,
										patch.participantsCount ?? item.participantsCount,
									),
									note: patch.note?.trim() || undefined,
								}
							: item,
					),
				)
			},
			removeItem: id => {
				setItems(current => current.filter(item => item.id !== id))
			},
			clearCart: () => setItems([]),
		}
	}, [isHydrated, items])

	return (
		<TourCartContext.Provider value={value}>{children}</TourCartContext.Provider>
	)
}

export function useTourCart() {
	const context = useContext(TourCartContext)

	if (!context) {
		throw new Error("useTourCart must be used within TourCartProvider")
	}

	return context
}
