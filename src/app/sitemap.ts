import type { MetadataRoute } from "next"

import { api } from "@/lib/api"
import { getSiteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getSiteUrl()

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/tours`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/group`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/cargo`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/contacts`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.6,
		},
		{
			url: `${baseUrl}/terms-of-service`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/privacy-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
	]

	try {
		const tours = await api.getTours()

		const tourRoutes = tours.items.map(tour => ({
			url: `${baseUrl}/tours/${tour.id}`,
			lastModified: tour.updatedAt
				? new Date(tour.updatedAt)
				: tour.createdAt
				? new Date(tour.createdAt)
				: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}))

		return [...staticRoutes, ...tourRoutes]
	} catch {
		return staticRoutes
	}
}
