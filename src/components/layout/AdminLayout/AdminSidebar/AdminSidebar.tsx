"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { AGENT_APPLICATION_PATH } from "@/lib/auth-redirect"
import { ROLE_LABEL } from "@/lib/roles"
import { useGSAP } from "@gsap/react"
import { useQuery } from "@tanstack/react-query"
import gsap from "gsap"
import {
	Compass,
	Headphones,
	Package,
	PlaneTakeoff,
	Power,
	ShoppingCart,
	Settings,
	UsersRound,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import s from "./AdminSidebar.module.scss"

export function AdminSidebar() {
	const pathname = usePathname()
	const { user } = useAuth()
	const { update } = useSession()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isMenuVisible, setIsMenuVisible] = useState(false)
	const navRef = useRef<HTMLElement | null>(null)
	const menuButtonRef = useRef<HTMLButtonElement | null>(null)
	const roleSyncAttemptedRef = useRef(false)

	const currentAgentApplicationQuery = useQuery({
		queryKey: ["agent-application", "me", user?.id],
		queryFn: () => api.getCurrentAgentApplication(),
		enabled: Boolean(user?.id) && user?.role === "CLIENT",
		staleTime: 30_000,
	})
	const currentAgentApplication = currentAgentApplicationQuery.data?.item ?? null
	const effectiveRole =
		user?.role === "CLIENT" && currentAgentApplication?.status === "APPROVED"
			? "AGENT"
			: user?.role
	const displayRole = effectiveRole ?? user?.role ?? "CLIENT"

	useEffect(() => {
		if (user?.role !== "CLIENT") return
		if (currentAgentApplication?.status !== "APPROVED") return
		if (roleSyncAttemptedRef.current) return

		roleSyncAttemptedRef.current = true
		void update()
	}, [currentAgentApplication?.status, update, user?.role])

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
		{
			href: "/client/flights",
			label: "Авиабилеты",
			icon: PlaneTakeoff,
			roles: ["CLIENT"],
		},
		{
			href: AGENT_APPLICATION_PATH,
			label: "Заявка агента",
			icon: Package,
			roles: ["CLIENT"],
		},
		{
			href: "/cart",
			label: "Корзина",
			icon: ShoppingCart,
			roles: ["CLIENT", "AGENT"],
		},
		{
			href: "/agent/flights",
			label: "Авиабилеты",
			icon: PlaneTakeoff,
			roles: ["AGENT"],
		},
		{
			href: "/client/tours",
			label: "Туры",
			icon: Compass,
			roles: ["AGENT"],
		},
		{
			href: "/client/group-transport",
			label: "Групповые перевозки",
			icon: UsersRound,
			roles: ["AGENT"],
		},
		// Менеджер и Админ
		{
			href: "/manager/tours",
			label: "Заказы по турам",
			icon: Compass,
			roles: ["MANAGER", "ADMIN"],
		},
		{
			href: "/manager/tours#guest-leads",
			label: "Лиды туров",
			icon: ShoppingCart,
			roles: ["MANAGER", "ADMIN"],
		},
		{
			href: "/manager/group-transport",
			label: "Заявки по групповым перевозкам",
			icon: UsersRound,
			roles: ["MANAGER", "ADMIN"],
		},
		{
			href: "/manager/flights",
			label: "Заявки на а/б и чартеры",
			icon: PlaneTakeoff,
			roles: ["MANAGER", "ADMIN"],
		},
		// Поддержка (для всех)
		{
			href: "/support",
			label: "Поддержка",
			icon: Headphones,
			roles: ["CLIENT", "AGENT", "MANAGER", "ADMIN"],
		},
		// Админ-панель (только для админа)
		{
			href: "/admin/tours",
			label: "Редактор туров",
			icon: Settings,
			roles: ["ADMIN"],
		},
		{
			href: "/admin/managers",
			label: "Менеджеры",
			icon: UsersRound,
			roles: ["ADMIN"],
		},
		{
			href: "/admin/currency",
			label: "Управление курсами валют",
			icon: Package,
			roles: ["ADMIN"],
		},
		{
			href: "/admin/agent-applications",
			label: "Заявки на турагентов",
			icon: UsersRound,
			roles: ["ADMIN"],
		},
	]

	const filteredNavItems = navItems.filter(item =>
		user ? item.roles.includes(displayRole) : false,
	)

	const { setIsTransitionComplete } = usePageTransition()

	const handleSignOut = useCallback(
		async () => {
			setIsMenuOpen(false)
			setIsMenuVisible(false)

			const container = document.getElementById("page-transition-container")
			const columns = container?.querySelectorAll(`[data-transition-column]`)

			if (container && columns?.length) {
				gsap.killTweensOf(columns)
				gsap.set(columns, { yPercent: -100 })
				container.style.pointerEvents = "none"
			}

			setIsTransitionComplete(true)

			try {
				await signOut({ redirect: false })
			} finally {
				window.location.assign("/login")
			}
		},
		[setIsTransitionComplete],
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

		if (target.closest("a, button")) {
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
				`.${s.menuLine}`,
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
		{ dependencies: [isMenuOpen], scope: menuButtonRef },
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
				},
			)
		},
		{ dependencies: [isMenuOpen, isMenuVisible], scope: navRef },
	)

	return (
		<aside className={s.sidebar}>
			<div className={s.sidebarContent}>
				<div className={s.header}>
					<div className={s.logoImage}>
						<Image
							src="/viva-logo.webp"
							alt="Viva Group"
							fill
							style={{ objectFit: "cover" }}
						/>
					</div>

					{user && (
						<div className={s.userInfo}>
							<div className={s.userAvatar}>
								{user.name && user.name.charAt(0)}
							</div>

								<div className={s.userInfoWrapper}>
									<p className={s.userName}>{user.name || user.email}</p>

									<div className={s.userMeta}>
										<p className={s.userRole}>{ROLE_LABEL[displayRole]}</p>

										{displayRole === "AGENT" && (
											<span className={s.agentBadge}>Агент</span>
										)}
									</div>
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

					<TransitionLink
						href="/"
						className={`${s.navItem} ${s.publicSite} ${s.navItemMobile}`}
					>
						<Package size={"2rem"} />

						<span>Публичный сайт</span>
					</TransitionLink>

					<button
						type="button"
						onClick={handleSignOut}
						className={`${s.navItem} ${s.logout} ${s.navItemMobile}`}
					>
						<Power className={s.icon} strokeWidth={3} />

						<span>Выйти</span>
					</button>
				</nav>
			</div>

			<div className={s.footer}>
				<TransitionLink href="/" className={`${s.navItem} ${s.publicSite}`}>
					<Package size={"2rem"} />

					<span>Публичный сайт</span>
				</TransitionLink>

				<button
					type="button"
					onClick={handleSignOut}
					className={`${s.navItem} ${s.logout}`}
				>
					<Power className={s.icon} strokeWidth={3} />

					<span>Выйти</span>
				</button>
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
