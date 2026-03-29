const DARK_HEADER_EXACT_ROUTES = ["/cart", "/for-agents"] as const

const DARK_HEADER_PREFIX_ROUTES = ["/tours/"] as const

export const DARK_HEADER_ROUTES = {
	exact: DARK_HEADER_EXACT_ROUTES,
	prefix: DARK_HEADER_PREFIX_ROUTES,
} as const

export function shouldUseDarkHeader(pathname: string | null): boolean {
	if (!pathname) return false

	if (DARK_HEADER_ROUTES.exact.some(route => route === pathname)) {
		return true
	}

	return DARK_HEADER_ROUTES.prefix.some(route => pathname.startsWith(route))
}
