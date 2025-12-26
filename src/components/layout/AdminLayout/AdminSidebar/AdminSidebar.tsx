"use client"

import { MarkerIcon3 } from "@/components/icons/MarkerIcon3"
import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useAuth } from "@/hooks/useAuth"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import {
	Compass,
	Headphones,
	Package,
	Power,
	Settings,
	UsersRound,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import s from "./AdminSidebar.module.scss"

export function AdminSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const { user } = useAuth()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isMenuVisible, setIsMenuVisible] = useState(false)
	const navRef = useRef<HTMLElement | null>(null)
	const menuButtonRef = useRef<HTMLButtonElement | null>(null)

	const navItems = [
		// Клиент
		{
			href: "/client/tours",
			label: "Туры",
			icon: Compass,
			roles: ["CLIENT"],
		},
		{
			href: "/client/group-transport",
			label: "Групповые перевозки",
			icon: UsersRound,
			roles: ["CLIENT"],
		},
		// Менеджер и Админ
		{
			href: "/manager/tours",
			label: "Туры",
			icon: Compass,
			roles: ["MANAGER", "ADMIN"],
		},
		{
			href: "/manager/group-transport",
			label: "Групповые перевозки",
			icon: UsersRound,
			roles: ["MANAGER", "ADMIN"],
		},
		// Поддержка (для всех)
		{
			href: "/support",
			label: "Поддержка",
			icon: Headphones,
			roles: ["CLIENT", "MANAGER", "ADMIN"],
		},
		// Админ-панель (только для админа)
		{
			href: "/admin/tours",
			label: "Админ-панель",
			icon: Settings,
			roles: ["ADMIN"],
		},
		{
			href: "/admin/managers",
			label: "Менеджеры",
			icon: UsersRound,
			roles: ["ADMIN"],
		},
	]

	const filteredNavItems = navItems.filter(item =>
		user?.role ? item.roles.includes(user.role) : false
	)

	const { setIsTransitionComplete } = usePageTransition()

	const handleSignOut = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault()

			const container = document.getElementById("page-transition-container")

			if (!container) {
				signOut({ redirect: false }).then(() => {
					router.push("/login")
				})

				return
			}

			const columns = container.querySelectorAll(`[data-transition-column]`)

			if (columns.length === 0) {
				signOut({ redirect: false }).then(() => {
					router.push("/login")
				})

				return
			}

			container.style.pointerEvents = "auto"

			gsap.set(columns, { yPercent: -100 })

			gsap.to(columns, {
				yPercent: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: "power4.inOut",
				onComplete: () => {
					signOut({ redirect: false }).then(() => {
						setIsTransitionComplete(false)
						router.push("/login")
					})
				},
			})
		},
		[setIsTransitionComplete, router]
	)

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
		<aside className={s.sidebar}>
			<div className={s.sidebarContent}>
				<div className={s.header}>
					<div className={s.logoWrapper}>
						<MarkerIcon3 />

						<h2 className={s.logo}>Viva Group</h2>
					</div>

					{user && (
						<div className={s.userInfo}>
							<div className={s.userAvatar}>
								{user.name && user.name.charAt(0)}
							</div>

							<div className={s.userInfoWrapper}>
								<p className={s.userName}>{user.name || user.email}</p>

								<p className={s.userRole}>{user.role}</p>
							</div>
						</div>
					)}
				</div>

				<nav
					ref={navRef}
					className={`${s.nav} ${isMenuVisible ? s.navActive : ""}`}
					onClick={handleNavClick}
				>
					{filteredNavItems.map(item => {
						const Icon = item.icon
						const isActive =
							pathname === item.href || pathname.startsWith(item.href + "/")

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`${s.navItem} ${isActive ? s.active : ""}`}
							>
								<Icon className={s.icon} />

								<span>{item.label}</span>
							</Link>
						)
					})}

					<TransitionLink href="/" className={`${s.navItem} ${s.publicSite}`}>
						<Package size={20} />

						<span>Публичный сайт</span>
					</TransitionLink>

					<TransitionLink
						href="/login"
						onClick={handleSignOut}
						className={`${s.navItem} ${s.logout}`}
					>
						<Power className={s.icon} strokeWidth={3} />

						<span>Выйти</span>
					</TransitionLink>
				</nav>
			</div>

			<div className={s.footer}>
				<TransitionLink href="/" className={`${s.navItem} ${s.publicSite}`}>
					<Package size={20} />

					<span>Публичный сайт</span>
				</TransitionLink>

				<TransitionLink
					href="/login"
					onClick={handleSignOut}
					className={`${s.navItem} ${s.logout}`}
				>
					<Power className={s.icon} strokeWidth={3} />

					<span>Выйти</span>
				</TransitionLink>
			</div>

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
		</aside>
	)
}
