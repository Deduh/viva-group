import { EmblaCarouselType } from "embla-carousel"
import { ComponentPropsWithRef, useCallback, useEffect, useState } from "react"

interface UseDotButtonType {
	selectedIndex: number
	scrollSnaps: number[]
	onDotButtonClick: (index: number) => void
}

export const useDotButton = (
	emblaApi: EmblaCarouselType | undefined
): UseDotButtonType => {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

	const onDotButtonClick = useCallback(
		(index: number) => {
			if (!emblaApi) return
			emblaApi.scrollTo(index)
		},
		[emblaApi]
	)

	const onInit = useCallback((emblaApi: EmblaCarouselType) => {
		setScrollSnaps(emblaApi.scrollSnapList())
	}, [])

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setSelectedIndex(emblaApi.selectedScrollSnap())
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		const handleInit = (api: EmblaCarouselType) => {
			onInit(api)
			onSelect(api)
		}
		const handleSelect = (api: EmblaCarouselType) => onSelect(api)

		emblaApi.on("reInit", handleInit).on("select", handleSelect)

		requestAnimationFrame(() => handleInit(emblaApi))

		return () => {
			emblaApi.off("reInit", handleInit).off("select", handleSelect)
		}
	}, [emblaApi, onInit, onSelect])

	return {
		selectedIndex,
		scrollSnaps,
		onDotButtonClick,
	}
}

type PropType = ComponentPropsWithRef<"button">

export const DotButton = (props: PropType) => {
	const { children, ...restProps } = props

	return (
		<button type="button" {...restProps}>
			{children}
		</button>
	)
}
