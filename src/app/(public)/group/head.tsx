import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Групповые перевозки")
	const description =
		"Организация групповых перевозок: маршруты, условия и поддержка менеджеров."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/group`} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={`${baseUrl}/group`} />
			<meta property="og:site_name" content="Viva Group" />
			<meta name="twitter:card" content="summary_large_image" />
		</>
	)
}
