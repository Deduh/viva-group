"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { usePreloader } from "@/context/PreloaderContext"
import { useAuth } from "@/hooks/useAuth"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
	ArrowUpRight,
	House,
	Layers,
	LogIn,
	Phone,
	PlaneTakeoff,
	UsersRound,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import s from "./Header.module.scss"
import { LinkItem, NavItem } from "./ui/NavItem/NavItem"

gsap.registerPlugin(ScrollTrigger)

const links: LinkItem[] = [
	{ href: "/", label: "Главная", icon: House },
	{
		label: "Разделы",
		isMenuOnly: true,
		subLinks: [
			{ href: "https://viva-fest.ru", label: "Viva Фестивали" },
			{ href: "https://viva-education.com", label: "Viva Образование" },
		],
		icon: Layers,
	},
	{ href: "/contacts", label: "Контакты", icon: Phone },
	{ href: "/tours", label: "Туры", icon: PlaneTakeoff },
	{ href: "/group", label: "Групповые перевозки", icon: UsersRound },
]

export function Header() {
	const headerRef = useRef<HTMLElement>(null)
	const buttonRef = useRef<HTMLAnchorElement>(null)
	const tl = useRef<gsap.core.Timeline | null>(null)
	const navRef = useRef<HTMLElement>(null)
	const menuButtonRef = useRef<HTMLButtonElement>(null)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isMenuVisible, setIsMenuVisible] = useState(false)

	const { isLoaded } = usePreloader()
	const { isTransitionComplete } = usePageTransition()
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

	const dashboardHref =
		!isAuthLoading && !isAuthenticated
			? "/login?callbackUrl=/client/tours"
			: "/client/tours"

	useGSAP(() => {
		if (!headerRef.current) return

		if (!isLoaded) {
			gsap.set(headerRef.current, { yPercent: -100, autoAlpha: 0 })
		}
	}, [isLoaded])

	useGSAP(() => {
		if (!headerRef.current) return

		if (isLoaded && isTransitionComplete) {
			gsap.to(headerRef.current, {
				yPercent: 0,
				autoAlpha: 1,
				duration: 0.8,
				ease: "power3.out",
			})
		} else {
			gsap.set(headerRef.current, {
				yPercent: -100,
				autoAlpha: 0,
			})
		}
	}, [isLoaded, isTransitionComplete])

	useGSAP(
		() => {
			if (!headerRef.current) return

			const scrollAnimation = gsap.to(headerRef.current, {
				backgroundColor: "rgba(20, 20, 20, 0.7)",
				backdropFilter: "blur(1.2rem)",
				"--menu-bg": "rgba(20, 20, 20, 0.85)",
				"--menu-border": "rgba(255, 255, 255, 0.1)",
				"--menu-shadow": "0 1rem 3rem rgba(0, 0, 0, 0.5)",
				"--item-hover": "rgba(255, 255, 255, 0.1)",
				duration: 0.4,
				scrollTrigger: {
					trigger: document.documentElement,
					start: "top -10%",
					end: "bottom bottom",
					toggleActions: "play none none reverse",
				},
			})

			return () => {
				if (scrollAnimation.scrollTrigger) {
					scrollAnimation.scrollTrigger.kill()
				}

				scrollAnimation.kill()
			}
		},
		{ scope: headerRef, dependencies: [] }
	)

	useGSAP(
		() => {
			if (!buttonRef.current) return

			const arrowMain = buttonRef.current.querySelector(
				`[data-header-arrow-main]`
			) as HTMLElement
			const arrowSecondary = buttonRef.current.querySelector(
				`[data-header-arrow-secondary]`
			) as HTMLElement

			if (!arrowMain || !arrowSecondary) return

			tl.current = gsap
				.timeline({ paused: true })
				.to(arrowMain, {
					x: "100%",
					y: "-100%",
					duration: 0.3,
					ease: "power2.inOut",
				})
				.to(
					arrowSecondary,
					{
						x: "0%",
						y: "0%",
						duration: 0.3,
						ease: "power2.inOut",
					},
					"<"
				)

			return () => {
				if (tl.current) {
					tl.current.kill()
					tl.current = null
				}
			}
		},
		{ scope: buttonRef }
	)

	const handleMouseEnter = () => tl.current?.play()
	const handleMouseLeave = () => tl.current?.reverse()
	const handleOpenMenu = () => {
		if (isMenuOpen) return

		setIsMenuVisible(true)
		setIsMenuOpen(true)
	}
	const handleCloseMenu = () => setIsMenuOpen(false)

	const handleToggleMenu = () => {
		if (isMenuOpen) {
			handleCloseMenu()
		} else {
			handleOpenMenu()
		}
	}
	const handleNavClick = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement

		if (target.closest("a")) {
			setIsMenuOpen(false)
		}
	}

	useEffect(() => {
		if (!isMenuOpen) return

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node

			if (navRef.current?.contains(target)) return
			if (menuButtonRef.current?.contains(target)) return

			setIsMenuOpen(false)
		}

		document.addEventListener("pointerdown", handleOutsideClick)

		return () => {
			document.removeEventListener("pointerdown", handleOutsideClick)
		}
	}, [isMenuOpen])

	useEffect(() => {
		if (!isMenuOpen) {
			if (!isMenuVisible) return
			if (!navRef.current) {
				setIsMenuVisible(false)
				return
			}

			if (window.matchMedia("(min-width: 769px)").matches) {
				setIsMenuVisible(false)
				return
			}

			gsap.killTweensOf(navRef.current)
			gsap.to(navRef.current, {
				scale: 0.92,
				y: -8,
				autoAlpha: 0,
				duration: 0.2,
				ease: "power2.in",
				onComplete: () => setIsMenuVisible(false),
			})
		}
	}, [isMenuOpen, isMenuVisible])

	useGSAP(
		() => {
			if (!menuButtonRef.current) return

			const lines = menuButtonRef.current.querySelectorAll<HTMLElement>(
				`.${s.menuLine}`
			)

			if (lines.length < 3) return

			gsap.set(lines, { transformOrigin: "center" })

			if (isMenuOpen) {
				gsap.to(lines[0], {
					y: 6,
					rotate: 45,
					duration: 0.25,
					ease: "power2.out",
				})
				gsap.to(lines[1], { opacity: 0, duration: 0.2, ease: "power2.out" })
				gsap.to(lines[2], {
					y: -6,
					rotate: -45,
					duration: 0.25,
					ease: "power2.out",
				})
			} else {
				gsap.to(lines[0], {
					y: 0,
					rotate: 0,
					duration: 0.25,
					ease: "power2.out",
				})
				gsap.to(lines[1], { opacity: 1, duration: 0.2, ease: "power2.out" })
				gsap.to(lines[2], {
					y: 0,
					rotate: 0,
					duration: 0.25,
					ease: "power2.out",
				})
			}
		},
		{ dependencies: [isMenuOpen], scope: menuButtonRef }
	)

	useGSAP(
		() => {
			if (!navRef.current || !isMenuOpen || !isMenuVisible) return
			if (window.matchMedia("(min-width: 769px)").matches) return

			gsap.killTweensOf(navRef.current)
			gsap.fromTo(
				navRef.current,
				{
					scale: 0.92,
					y: -8,
					autoAlpha: 0,
					transformOrigin: "top right",
				},
				{
					scale: 1,
					y: 0,
					autoAlpha: 1,
					duration: 0.35,
					ease: "back.out(1.4)",
				}
			)
		},
		{ dependencies: [isMenuOpen, isMenuVisible], scope: navRef }
	)

	return (
		<header ref={headerRef} className={s.header}>
			<TransitionLink href="/" className={s.logo}>
				<Image
					className={s.logoImage}
					src="/viva-logo.webp"
					alt="Viva Tour Logo"
					fill
				/>
			</TransitionLink>

			<nav
				ref={navRef}
				className={`${s.nav} ${isMenuVisible ? s.navActive : ""}`}
				onClick={handleNavClick}
			>
				{links.map(link => (
					<NavItem
						key={link.href || link.label}
						item={link}
						isMenuOpen={isMenuOpen}
						onCloseMenu={handleCloseMenu}
					/>
				))}

				<div className={s.buttonMobile}>
					<NavItem
						item={{ href: dashboardHref, label: "Личный кабинет", icon: LogIn }}
						isMenuOpen={isMenuOpen}
						onCloseMenu={handleCloseMenu}
					/>
				</div>
			</nav>

			<TransitionLink
				href={dashboardHref}
				className={s.button}
				ref={buttonRef}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div className={s.buttonText}>Личный кабинет</div>

				<div className={s.buttonIcon}>
					<div className={s.arrowMain} data-header-arrow-main>
						<ArrowUpRight size={"2rem"} color="#ffffff" />
					</div>

					<div className={s.arrowSecondary} data-header-arrow-secondary>
						<ArrowUpRight size={"2rem"} color="#ffffff" />
					</div>
				</div>
			</TransitionLink>

			<button
				className={s.menu}
				type="button"
				onClick={handleToggleMenu}
				aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
				aria-expanded={isMenuOpen}
				ref={menuButtonRef}
			>
				<div className={s.menuLine} />

				<div className={s.menuLine} />

				<div className={s.menuLine} />
			</button>
		</header>
	)
}
