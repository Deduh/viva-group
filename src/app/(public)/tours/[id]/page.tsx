import { TourChat } from "@/components/pages/ToursPage/TourChat/TourChat"
import { TransitionLink } from "@/components/ui/PageTransition"
import {
	BLUR_PLACEHOLDER,
	getDetailPageImageSizes,
	getTourImageAlt,
} from "@/lib/image-utils"
import Image from "next/image"
import { notFound } from "next/navigation"

import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/format"
import styles from "./page.module.scss"

interface TourDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function TourDetailPage({
	params,
}: TourDetailPageProps) {
	const { id } = await params
	const tour = await api.getTour(id).catch(() => null)
	if (!tour) return notFound()

	return (
		<div className={styles.page}>
			<section className={styles.section}>
				<TransitionLink href="/tours" className={styles.back}>
					← Все туры
				</TransitionLink>

				<div className={styles.imageWrapper}>
					<Image
						src={tour.image}
						alt={getTourImageAlt(tour.destination, tour.shortDescription)}
						fill
						sizes={getDetailPageImageSizes()}
						priority
						placeholder="blur"
						blurDataURL={BLUR_PLACEHOLDER}
						className={styles.image}
					/>
				</div>

				<p className={styles.tag}>{tour.destination}</p>
				<h1>{tour.destination}</h1>
				<p className={styles.meta}>Рейтинг: {tour.rating}</p>
				<p className={styles.price}>от {formatCurrency(tour.price)}</p>
				<p className={styles.desc}>{tour.shortDescription}</p>
				<div className={styles.infoBox}>
					<p>Что включено:</p>
					<ul>
						{tour.properties.map(property => (
							<li key={property}>{property}</li>
						))}
					</ul>
					<TransitionLink href="/login" className={styles.primary}>
						Забронировать
					</TransitionLink>
				</div>

				<div className={styles.chatSection}>
					<TourChat tourId={tour.id} />
				</div>
			</section>
		</div>
	)
}
