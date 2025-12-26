import { useGSAP } from "@gsap/react"
import { EmblaCarouselType } from "embla-carousel"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
	ComponentPropsWithRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react"
import s from "./EmblaCarousel.module.scss"

interface UsePrevNextButtonsType {
	prevBtnDisabled: boolean
	nextBtnDisabled: boolean
	onPrevButtonClick: () => void
	onNextButtonClick: () => void
}

export const usePrevNextButtons = (
	emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
	const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
	const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

	const onPrevButtonClick = useCallback(() => {
		if (!emblaApi) return

		emblaApi.scrollPrev()
	}, [emblaApi])

	const onNextButtonClick = useCallback(() => {
		if (!emblaApi) return

		emblaApi.scrollNext()
	}, [emblaApi])

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setPrevBtnDisabled(!emblaApi.canScrollPrev())
		setNextBtnDisabled(!emblaApi.canScrollNext())
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		const handleSelect = (api: EmblaCarouselType) => onSelect(api)

		emblaApi.on("reInit", handleSelect).on("select", handleSelect)

		requestAnimationFrame(() => handleSelect(emblaApi))
	}, [emblaApi, onSelect])

	return {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	}
}

type PropType = ComponentPropsWithRef<"button">

export const PrevButton = (props: PropType) => {
	const { ...restProps } = props

	const container = useRef<HTMLButtonElement>(null)
	const tl = useRef<gsap.core.Timeline | null>(null)

	useGSAP(
		() => {
			if (!container.current) return

			const iconMain = container.current.querySelector(
				`[data-embla-icon-main]`
			) as HTMLElement
			const iconCopy = container.current.querySelector(
				`[data-embla-icon-copy]`
			) as HTMLElement

			if (!iconMain || !iconCopy) return

			tl.current = gsap.timeline({ paused: true })

			gsap.set(iconCopy, { xPercent: 150 })

			tl.current
				.to(iconMain, {
					xPercent: -150,
					duration: 0.4,
					ease: "power2.inOut",
				})
				.to(
					iconCopy,
					{
						xPercent: 0,
						duration: 0.4,
						ease: "power2.inOut",
					},
					"<"
				)
		},
		{ scope: container }
	)

	return (
		<button
			ref={container}
			className={`${s.button} ${s.button__prev}`}
			type="button"
			onMouseEnter={() => tl.current?.play()}
			onMouseLeave={() => tl.current?.reverse()}
			{...restProps}
		>
			<div className={s.inner}>
				<div className={s.iconMain} data-embla-icon-main>
					<ChevronLeft size={"2rem"} />
				</div>

				<div className={s.iconCopy} data-embla-icon-copy>
					<ChevronLeft size={"2rem"} />
				</div>
			</div>
		</button>
	)
}

export const NextButton = (props: PropType) => {
	const { ...restProps } = props

	const container = useRef<HTMLButtonElement>(null)
	const tl = useRef<gsap.core.Timeline | null>(null)

	useGSAP(
		() => {
			if (!container.current) return

			const iconMain = container.current.querySelector(
				`[data-embla-icon-main]`
			) as HTMLElement
			const iconCopy = container.current.querySelector(
				`[data-embla-icon-copy]`
			) as HTMLElement

			if (!iconMain || !iconCopy) return

			tl.current = gsap.timeline({ paused: true })

			gsap.set(iconCopy, { xPercent: -150 })

			tl.current
				.to(iconMain, {
					xPercent: 150,
					duration: 0.4,
					ease: "power2.inOut",
				})
				.to(
					iconCopy,
					{
						xPercent: 0,
						duration: 0.4,
						ease: "power2.inOut",
					},
					"<"
				)
		},
		{ scope: container }
	)

	return (
		<button
			ref={container}
			className={`${s.button} ${s.button__next}`}
			type="button"
			onMouseEnter={() => tl.current?.play()}
			onMouseLeave={() => tl.current?.reverse()}
			{...restProps}
		>
			<div className={s.inner}>
				<div className={s.iconMain} data-embla-icon-main>
					<ChevronRight size={"2rem"} />
				</div>

				<div className={s.iconCopy} data-embla-icon-copy>
					<ChevronRight size={"2rem"} />
				</div>
			</div>
		</button>
	)
}
