import s from "./FilterCarousel.module.scss"

interface FilterCarouselProps {
	categories: string[]
	active: string
	onSelect: (category: string) => void
}

export function FilterCarousel({
	categories,
	active,
	onSelect,
}: FilterCarouselProps) {
	return (
		<div className={s.filter}>
			{categories.map(category => (
				<button
					key={category}
					type="button"
					className={`${s.chip} ${active === category ? s.chipActive : ""}`}
					onClick={() => onSelect(category)}
				>
					{category}
				</button>
			))}
		</div>
	)
}
