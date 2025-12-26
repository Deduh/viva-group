"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import s from "./BackButton.module.scss"

interface BackButtonProps {
	href: string
	label: string
}

export function BackButton({ href, label }: BackButtonProps) {
	return (
		<Link href={href} className={s.back}>
			<ArrowLeft size={20} />

			<span>{label}</span>
		</Link>
	)
}
