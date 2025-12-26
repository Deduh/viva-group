"use client"

import { MarkerIcon3 } from "@/components/icons/MarkerIcon3"
import { TransitionLink } from "@/components/ui/PageTransition"
import { usePageTransition } from "@/context/PageTransitionContext"
import { useAuth } from "@/hooks/useAuth"
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
import { useCallback } from "react"
import s from "./AdminSidebar.module.scss"

export function AdminSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const { user } = useAuth()

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

				<nav className={s.nav}>
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
		</aside>
	)
}
