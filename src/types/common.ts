export type ApiSuccess<T> = {
	data: T
	error: null
}

export type ApiError = {
	data: null
	error: {
		message: string
		code?: string
		statusCode?: number
		details?: unknown
	}
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type ApiCollection<T> = {
	items: T[] // Массив элементов
	total?: number // Общее количество элементов
	pagination?: PaginationMeta // Информация о пагинации
}

export type PaginationMeta = {
	page?: number // Текущая страница
	limit?: number // Количество элементов на странице
	total?: number // Общее количество элементов
	totalPages?: number // Общее количество страниц
	hasNext?: boolean // Есть ли следующая страница
	hasPrev?: boolean // Есть ли предыдущая страница
}

export type SortParams<T> = {
	sortBy: keyof T // Поле для сортировки
	sortOrder: "asc" | "desc" // Направление сортировки
}

export type PaginationParams = {
	page?: number // Номер страницы (начинается с 1)
	limit?: number // Количество элементов на странице
}

export type FormState<T> = {
	values: T
	errors: Partial<Record<keyof T, string>>
	isSubmitting: boolean
	isDirty: boolean // Была ли форма изменена
	isValid: boolean
}

export type LoadingState = "idle" | "loading" | "success" | "error"

export type AsyncData<T> = {
	data: T | null
	status: LoadingState
	error: Error | null
	isLoading: boolean
	isSuccess: boolean
	isError: boolean
}

export type Coordinates = {
	latitude: number
	longitude: number
}

export type SelectOption<T = string> = {
	value: T
	label: string
	disabled?: boolean
	icon?: string
}

export type IdParam = {
	id: string
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>

export type Result<T, E = Error> =
	| { success: true; data: T }
	| { success: false; error: E }

export type ErrorHandler<T> = {
	onApiError?: (error: import("@/lib/errors").ApiError) => T
	onNetworkError?: (error: import("@/lib/errors").NetworkError) => T
	onValidationError?: (error: import("@/lib/errors").ValidationError) => T
	onUnknownError?: (error: unknown) => T
}
