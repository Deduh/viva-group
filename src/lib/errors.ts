export class ApiError extends Error {
	readonly type = "ApiError" as const

	constructor(
		message: string,
		public statusCode: number,
		public code?: string,
		public details?: unknown
	) {
		super(message)
		this.name = "ApiError"

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError)
		}
	}
}

export class NetworkError extends Error {
	readonly type = "NetworkError" as const

	constructor(message: string = "Ошибка сети") {
		super(message)
		this.name = "NetworkError"

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NetworkError)
		}
	}
}

export class ValidationError extends Error {
	readonly type = "ValidationError" as const

	constructor(message: string, public fields?: Record<string, string[]>) {
		super(message)
		this.name = "ValidationError"

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError)
		}
	}
}

export type AppError = ApiError | NetworkError | ValidationError

export type ErrorInfo = {
	message: string
	status: number | null
	type: "ApiError" | "NetworkError" | "ValidationError" | "Unknown"
	timestamp: string
} & (
	| { type: "ApiError"; statusCode: number; code?: string; details?: unknown }
	| { type: "NetworkError" }
	| { type: "ValidationError"; fields?: Record<string, string[]> }
	| { type: "Unknown" }
)

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError
}

export function isNetworkError(error: unknown): error is NetworkError {
	return error instanceof NetworkError
}

export function isValidationError(error: unknown): error is ValidationError {
	return error instanceof ValidationError
}

export function isAppError(error: unknown): error is AppError {
	return isApiError(error) || isNetworkError(error) || isValidationError(error)
}

export function getErrorStatus(error: unknown): number | null {
	if (isApiError(error)) {
		return error.statusCode
	}

	if (error instanceof Error) {
		const statusMatch = error.message.match(/status (\d+)/i)

		if (statusMatch) {
			return parseInt(statusMatch[1], 10)
		}

		if ("status" in error) {
			const status = (error as { status: unknown }).status

			if (typeof status === "number") {
				return status
			}
		}

		if ("statusCode" in error) {
			const statusCode = (error as { statusCode: unknown }).statusCode

			if (typeof statusCode === "number") {
				return statusCode
			}
		}
	}

	return null
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}

	if (typeof error === "string") {
		return error
	}

	return "Произошла неизвестная ошибка"
}

export function getErrorInfo(error: unknown): ErrorInfo {
	const status = getErrorStatus(error)
	const message = getErrorMessage(error)
	const timestamp = new Date().toISOString()

	if (isApiError(error)) {
		return {
			type: "ApiError",
			message,
			status,
			statusCode: error.statusCode,
			code: error.code,
			details: error.details,
			timestamp,
		}
	}

	if (isNetworkError(error)) {
		return {
			type: "NetworkError",
			message,
			status,
			timestamp,
		}
	}

	if (isValidationError(error)) {
		return {
			type: "ValidationError",
			message,
			status,
			fields: error.fields,
			timestamp,
		}
	}

	return {
		type: "Unknown",
		message,
		status,
		timestamp,
	}
}

export function shouldRetryError(
	error: unknown,
	failureCount: number,
	maxRetries: number = 2
): boolean {
	if (failureCount >= maxRetries) {
		return false
	}

	if (isNetworkError(error)) {
		return false
	}

	if (isValidationError(error)) {
		return false
	}

	const status = getErrorStatus(error)
	if (status !== null && status >= 400 && status < 500) {
		return false
	}

	return true
}
