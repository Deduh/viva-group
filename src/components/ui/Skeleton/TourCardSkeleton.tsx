import { Skeleton } from "./Skeleton"
import s from "./TourCardSkeleton.module.scss"

type TourCardSkeletonProps = {
	count?: number
}

export function TourCardSkeleton({ count = 1 }: TourCardSkeletonProps) {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className={s.card}>
					<Skeleton height={20} className={s.image} />

					<div className={s.content}>
						<Skeleton width="60%" height={1.6} />

						<Skeleton width="100%" height={1.4} />

						<Skeleton width="80%" height={1.4} />

						<div className={s.footer}>
							<Skeleton width="30%" height={2} />

							<Skeleton width={12} height={4} />
						</div>
					</div>
				</div>
			))}
		</>
	)
}
