import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Условия использования")
	const description =
		"Условия использования сервиса Viva Group: бронирование, оплата и ответственность."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/terms-of-service`} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={`${baseUrl}/terms-of-service`} />
			<meta property="og:site_name" content="Viva Group" />
			<meta name="twitter:card" content="summary_large_image" />
		</>
	)
}
