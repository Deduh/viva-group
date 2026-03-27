import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { getErrorInfo, shouldRetryError } from "./errors"

function getRetryDelay(attemptIndex: number): number {
	return Math.min(1000 * 2 ** attemptIndex, 30000)
}

function serializeError(error: unknown) {
	if (error instanceof Error) {
		const extra =
			typeof error === "object" && error !== null
				? {
						status:
							"status" in error && typeof error.status === "number"
								? error.status
								: null,
						statusCode:
							"statusCode" in error && typeof error.statusCode === "number"
								? error.statusCode
								: null,
						code:
							"code" in error && typeof error.code === "string"
								? error.code
								: undefined,
						cause: "cause" in error ? error.cause : undefined,
					}
				: {}

		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			...extra,
		}
	}

	if (typeof error === "object" && error !== null) {
		return { ...error }
	}

	return { value: error }
}

const queryCache = new QueryCache({
	onError: (error, query) => {
		const errorInfo = getErrorInfo(error)
		const payload = {
			...errorInfo,
			queryKey: query.queryKey,
			queryHash: query.queryHash,
			rawError: serializeError(error),
		}

		if (errorInfo.status === 401 || errorInfo.status === 403) {
			console.warn("[Query Auth Error]", payload, error)
			return
		}

		console.error("[Query Error]", payload, error)

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
			rawError: serializeError(error),
		}

		if (errorInfo.status === 401 || errorInfo.status === 403) {
			console.warn("[Mutation Auth Error]", payload, error)
			return
		}

		console.error("[Mutation Error]", payload, error)

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
