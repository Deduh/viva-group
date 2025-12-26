"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type FieldValues, type UseFormProps, useForm } from "react-hook-form"
import type { z } from "zod"
import { useToast } from "./useToast"

type UseFormWithToastOptions<TFieldValues extends FieldValues> = Omit<
	UseFormProps<TFieldValues>,
	"resolver"
> & {
	schema: z.ZodType<TFieldValues>
	successMessage?: string
	errorMessage?: string
}

export function useFormWithToast<
	TFieldValues extends FieldValues = FieldValues
>({
	schema,
	successMessage = "Успешно!",
	errorMessage = "Произошла ошибка",
	...formOptions
}: UseFormWithToastOptions<TFieldValues>) {
	const { showSuccess, showError } = useToast()

	const form = useForm<TFieldValues>({
		...formOptions,
		// @ts-expect-error - zodResolver generic constraint issue with FieldValues
		resolver: zodResolver(schema),
	})

	const handleSubmitWithToast = (
		onValid: (data: TFieldValues) => Promise<void> | void
	) => {
		return form.handleSubmit(async data => {
			try {
				// @ts-expect-error - FieldValues subtype constraint issue
				await onValid(data)

				showSuccess(successMessage)
			} catch (error) {
				console.error("Form submission error:", error)
				showError(errorMessage)
			}
		})
	}

	return {
		...form,
		handleSubmitWithToast,
	}
}
