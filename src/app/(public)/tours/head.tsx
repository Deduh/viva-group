import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Туры")
	const description =
		"Каталог туров Viva Group: направления, цены, рейтинг и подбор идеального маршрута."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/tours`} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={`${baseUrl}/tours`} />
			<meta property="og:site_name" content="Viva Group" />
			<meta name="twitter:card" content="summary_large_image" />
		</>
	)
}
