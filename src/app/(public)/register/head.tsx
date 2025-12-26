import { buildTitle, getSiteUrl } from "@/lib/seo"

export default function Head() {
	const baseUrl = getSiteUrl()
	const title = buildTitle("Регистрация")
	const description = "Регистрация в Viva Group."

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={`${baseUrl}/register`} />
			<meta name="robots" content="noindex, nofollow" />
		</>
	)
}
