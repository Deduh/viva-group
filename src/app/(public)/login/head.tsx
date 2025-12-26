import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Вход")
	const description = "Вход в личный кабинет Viva Group."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/login`} />
			<meta name="robots" content="noindex, nofollow" />
		</>
	)
}
