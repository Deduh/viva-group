import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Контакты")
	const description =
		"Контакты Viva Group: связи, формы обращений и поддержка клиентов."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/contacts`} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={`${baseUrl}/contacts`} />
			<meta property="og:site_name" content="Viva Group" />
			<meta name="twitter:card" content="summary_large_image" />
		</>
	)
}
