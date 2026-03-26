import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { getErrorInfo, shouldRetryError } from "./errors"

function getRetryDelay(attemptIndex: number): number {
	return Math.min(1000 * 2 ** attemptIndex, 30000)
}

const queryCache = new QueryCache({
	onError: (error, query) => {
		const errorInfo = getErrorInfo(error)
		const payload = {
			...errorInfo,
			queryKey: query.queryKey,
		}

		if (errorInfo.status === 401 || errorInfo.status === 403) {
			console.warn("[Query Auth Error]", payload)
			return
		}

		console.error("[Query Error]", payload)

		// TODO: Здесь можно добавить отправку в систему мониторинга
		// Например: Sentry.captureException(error, { tags: { queryKey: query.queryKey, errorType: errorInfo.type } })
	},
})

const mutationCache = new MutationCache({
	onError: (error, _variables, _context, mutation) => {
		const errorInfo = getErrorInfo(error)
		const payload = {
			...errorInfo,
			mutationKey: mutation.options.mutationKey,
		}

		if (errorInfo.status === 401 || errorInfo.status === 403) {
			console.warn("[Mutation Auth Error]", payload)
			return
		}

		console.error("[Mutation Error]", payload)

		// TODO: Здесь можно добавить отправку в систему мониторинга
		// Например: Sentry.captureException(error, { tags: { mutationKey: mutation.options.mutationKey, errorType: errorInfo.type } })
	},
})

export const queryClient = new QueryClient({
	queryCache,
	mutationCache,
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 минут
			gcTime: 10 * 60 * 1000, // 10 минут
			retry: (failureCount, error) => shouldRetryError(error, failureCount),
			retryDelay: getRetryDelay,
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: (failureCount, error) => shouldRetryError(error, failureCount),
			retryDelay: getRetryDelay,
		},
	},
})
