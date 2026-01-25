"use client"

import { TransitionLink } from "@/components/ui/PageTransition"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import s from "./NavItem.module.scss"

export type SubLink = { href: string; label: string }

export type LinkItem = {
	href?: string
	label: string
	subLinks?: SubLink[]
	isMenuOnly?: boolean
	icon?: LucideIcon
}

interface NavItemProps {
	item: LinkItem
	isMenuOpen?: boolean
	onCloseMenu?: () => void
}

export function NavItem({ item, isMenuOpen, onCloseMenu }: NavItemProps) {
	const pathname = usePathname()
	const Icon = item.icon

	const container = useRef(null)
	const dropdownRef = useRef(null)
	const chevronRef = useRef(null)
	const tl = useRef<gsap.core.Timeline | null>(null)

	const hasSubLinks = item.subLinks && item.subLinks.length > 0
	const [isMobileSubMenuOpen, setIsMobileSubMenuOpen] = useState(false)
	const isActive = item.href
		? pathname === item.href || pathname.startsWith(item.href + "/")
		: hasSubLinks
			? item.subLinks!.some(
					sub =>
						sub.href.startsWith("/") &&
						(pathname === sub.href || pathname.startsWith(sub.href + "/")),
				)
			: false

	useEffect(() => {
		if (!isMenuOpen) {
			setIsMobileSubMenuOpen(false)
		}
	}, [isMenuOpen])

	useGSAP(
		() => {
			if (!hasSubLinks) return

			tl.current = gsap
				.timeline({ paused: true })
				.to(dropdownRef.current, {
					autoAlpha: 1,
					y: 0,
					duration: 0.3,
					ease: "power2.out",
				})
				.to(
					chevronRef.current,
					{
						rotation: 180,
						duration: 0.3,
						ease: "power2.out",
					},
					"<",
				)

			gsap.set(dropdownRef.current, { y: 10 })
		},
		{ scope: container },
	)

	return (
		<div
			ref={container}
			className={s.navItem}
			onMouseEnter={() => hasSubLinks && tl.current?.play()}
			onMouseLeave={() => hasSubLinks && tl.current?.reverse()}
		>
			{item.isMenuOnly ? (
				<button
					type="button"
					className={`${s.linkWrapper} ${isActive ? s.active : ""}`}
					onClick={() => setIsMobileSubMenuOpen(true)}
				>
					{Icon && (
						<span className={s.linkIcon}>
							<Icon size={"1.8rem"} />
						</span>
					)}

					<span>{item.label}</span>

					{hasSubLinks && (
						<div ref={chevronRef} className={s.chevron}>
							<ChevronDown size={"1.8rem"} />
						</div>
					)}
				</button>
			) : (
				<TransitionLink
					href={item.href || "#"}
					className={`${s.linkWrapper} ${isActive ? s.active : ""}`}
					onClick={onCloseMenu}
				>
					{Icon && (
						<span className={s.linkIcon}>
							<Icon size={"1.4rem"} />
						</span>
					)}
					<span>{item.label}</span>

					{hasSubLinks && (
						<div ref={chevronRef} className={s.chevron}>
							<ChevronDown size={"1.8rem"} />
						</div>
					)}
				</TransitionLink>
			)}

			{hasSubLinks && (
				<div ref={dropdownRef} className={s.dropdown}>
					{item.subLinks!.map(sub =>
						sub.href.startsWith("http") ? (
							<TransitionLink
								key={sub.href}
								href={sub.href}
								className={s.subLink}
								onClick={onCloseMenu}
							>
								{sub.label}
							</TransitionLink>
						) : (
							<TransitionLink
								key={sub.href}
								href={sub.href}
								className={s.subLink}
								onClick={onCloseMenu}
							>
								{sub.label}
							</TransitionLink>
						),
					)}
				</div>
			)}

			{hasSubLinks && (
				<div
					className={`${s.mobilePanel} ${
						isMobileSubMenuOpen ? s.mobilePanelOpen : ""
					}`}
				>
					<button
						type="button"
						className={s.mobileBack}
						onClick={() => setIsMobileSubMenuOpen(false)}
					>
						<ArrowLeft size={"1.4rem"} />

						<span>Назад</span>
					</button>

					{item.subLinks!.map(sub => (
						<Link
							key={sub.href}
							href={sub.href}
							className={s.mobileLink}
							target="_blank"
							rel="noreferrer"
							onClick={() => {
								setIsMobileSubMenuOpen(false)
								onCloseMenu?.()
							}}
						>
							{sub.label}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
