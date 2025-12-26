import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Политика конфиденциальности")
	const description =
		"Политика конфиденциальности Viva Group: какие данные собираем и как их используем."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/privacy-policy`} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={`${baseUrl}/privacy-policy`} />
			<meta property="og:site_name" content="Viva Group" />
			<meta name="twitter:card" content="summary_large_image" />
		</>
	)
}
