export const BLUR_PLACEHOLDER =
	"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

export function getImageSizes(breakpoints?: {
	mobile?: string
	tablet?: string
	desktop?: string
}): string {
	const mobile = breakpoints?.mobile || "100vw"
	const tablet = breakpoints?.tablet || "50vw"
	const desktop = breakpoints?.desktop || "33vw"

	return `(max-width: 768px) ${mobile}, (max-width: 1200px) ${tablet}, ${desktop}`
}

export function getDetailPageImageSizes(): string {
	return "(max-width: 1200px) 100vw, 1200px"
}

export function shouldUsePriority(index: number, threshold = 3): boolean {
	return index < threshold
}

export function getLoadingStrategy(
	index: number,
	threshold = 6
): "eager" | "lazy" {
	return index < threshold ? "eager" : "lazy"
}

export function getTourImageAlt(
	destination: string,
	additionalInfo?: string
): string {
	const base = `Тур в ${destination}`

	return additionalInfo ? `${base} - ${additionalInfo}` : base
}
