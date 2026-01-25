"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { api } from "@/lib/api"
import { formatImageUrlForDisplay } from "@/lib/url"
import {
	tourCreateInputSchema,
	tourUpdateInputSchema,
	type TourCreateInput,
	type TourUpdateInput,
} from "@/lib/validation"
import type { Tour } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Image as ImageIcon, Loader2 } from "lucide-react"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import s from "./TourForm.module.scss"

interface TourFormPropsCreate {
	tour?: undefined
	onSubmit: (data: TourCreateInput) => Promise<void>
	onCancel?: () => void
}

interface TourFormPropsUpdate {
	tour: Tour
	onSubmit: (data: TourUpdateInput) => Promise<void>
	onCancel?: () => void
}

type TourFormProps = TourFormPropsCreate | TourFormPropsUpdate

export function TourForm({ tour, onSubmit, onCancel }: TourFormProps) {
	const isEditMode = !!tour
	const [tagsInput, setTagsInput] = useState(tour?.tags.join(", ") || "")
	const [propertiesInput, setPropertiesInput] = useState(
		tour?.properties.join(", ") || "",
	)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const schema = isEditMode ? tourUpdateInputSchema : tourCreateInputSchema

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
	} = useForm<TourCreateInput | TourUpdateInput>({
		resolver: zodResolver(schema),
		defaultValues: tour
			? ({
					destination: tour.destination,
					shortDescription: tour.shortDescription,
					fullDescription: tour.fullDescription || "",
					properties: tour.properties,
					price: tour.price,
					image: formatImageUrlForDisplay(tour.image),
					tags: tour.tags,
					rating: tour.rating,
					duration: tour.duration,
					maxPartySize: tour.maxPartySize,
					minPartySize: tour.minPartySize,
					available: tour.available ?? true,
				} as TourUpdateInput)
			: ({
					destination: "",
					shortDescription: "",
					fullDescription: "",
					properties: [],
					price: 0,
					image: "",
					tags: [],
					rating: 0,
					duration: undefined,
					maxPartySize: undefined,
					minPartySize: undefined,
					available: true,
				} as TourCreateInput),
	})
	const imageField = register("image")

	useEffect(() => {
		const tags = tagsInput
			.split(",")
			.map(t => t.trim())
			.filter(t => t.length > 0)
		setValue("tags", tags)
	}, [tagsInput, setValue])

	useEffect(() => {
		const properties = propertiesInput
			.split(",")
			.map(p => p.trim())
			.filter(p => p.length > 0)
		setValue("properties", properties)
	}, [propertiesInput, setValue])

	const handleFormSubmit = async (data: TourCreateInput | TourUpdateInput) => {
		const cleanedData = {
			...data,
			fullDescription:
				data.fullDescription === "" ? undefined : data.fullDescription,
			duration:
				data.duration === "" || data.duration === undefined
					? undefined
					: Number(data.duration),
			maxPartySize:
				data.maxPartySize === "" || data.maxPartySize === undefined
					? undefined
					: Number(data.maxPartySize),
			minPartySize:
				data.minPartySize === "" || data.minPartySize === undefined
					? undefined
					: Number(data.minPartySize),
		}

		// @ts-expect-error - TypeScript не может проверить union type, но в рантайме все корректно
		await onSubmit(cleanedData)
	}

	const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]

		if (!file) return

		setUploadError(null)
		setIsUploading(true)

		try {
			const { url } = await api.uploadTourImage(file)
			setValue("image", formatImageUrlForDisplay(url), { shouldDirty: true })
		} catch (err) {
			setUploadError(
				err instanceof Error ? err.message : "Не удалось загрузить изображение",
			)
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<form className={s.form} onSubmit={handleSubmit(handleFormSubmit)}>
			<div className={s.section}>
				<h3 className={s.sectionTitle}>Основная информация</h3>

				<Input
					label="Название направления"
					type="text"
					placeholder="Например: Санторини, Греция"
					error={errors.destination?.message}
					disabled={isSubmitting}
					required
					{...register("destination")}
				/>

				<TextArea
					label="Краткое описание"
					placeholder="Краткое описание тура (до 500 символов)"
					rows={3}
					maxLength={500}
					showCharCount
					error={errors.shortDescription?.message}
					disabled={isSubmitting}
					required
					{...register("shortDescription")}
				/>

				<TextArea
					label="Полное описание (опционально)"
					placeholder="Подробное описание тура (до 5000 символов)"
					rows={6}
					maxLength={5000}
					showCharCount
					error={errors.fullDescription?.message}
					disabled={isSubmitting}
					{...register("fullDescription")}
				/>
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Цена и изображение</h3>

				<Input
					label="Цена (₽)"
					type="number"
					step="0.01"
					min="0.01"
					placeholder="0.00"
					error={errors.price?.message}
					disabled={isSubmitting}
					required
					{...register("price", { valueAsNumber: true })}
				/>

				<Input
					label="URL изображения"
					type="url"
					placeholder="/tours/tour-1.jpg или https://example.com/image.jpg"
					error={errors.image?.message}
					disabled={isSubmitting}
					required
					{...imageField}
					onBlur={event => {
						imageField.onBlur(event)
						setValue("image", formatImageUrlForDisplay(event.target.value), {
							shouldDirty: true,
						})
					}}
				/>

				<div className={s.uploadRow}>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className={s.fileInput}
						onChange={handleFileSelect}
					/>

					<button
						type="button"
						className={s.uploadButton}
						onClick={() => fileInputRef.current?.click()}
						disabled={isSubmitting || isUploading}
					>
						{isUploading ? (
							<>
								<Loader2 size={"1.8rem"} className={s.spin} />
								Загружаем...
							</>
						) : (
							<>
								<ImageIcon size={"1.8rem"} />
								Загрузить изображение
							</>
						)}
					</button>
				</div>

				{uploadError && <p className={s.errorText}>{uploadError}</p>}
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Характеристики</h3>

				<Input
					label="Рейтинг (0-5)"
					type="number"
					step="0.1"
					min="0"
					max="5"
					placeholder="0"
					error={errors.rating?.message}
					disabled={isSubmitting}
					{...register("rating", { valueAsNumber: true })}
				/>

				<Input
					label="Длительность (дни, опционально)"
					type="number"
					min="1"
					placeholder="Например: 7"
					error={errors.duration?.message}
					disabled={isSubmitting}
					{...register("duration", {
						setValueAs: v => (v === "" ? undefined : Number(v)),
					})}
				/>

				<div className={s.row}>
					<Input
						label="Минимум участников (опционально)"
						type="number"
						min="1"
						placeholder="Например: 2"
						error={errors.minPartySize?.message}
						disabled={isSubmitting}
						{...register("minPartySize", {
							setValueAs: v => (v === "" ? undefined : Number(v)),
						})}
					/>

					<Input
						label="Максимум участников (опционально)"
						type="number"
						min="1"
						placeholder="Например: 10"
						error={errors.maxPartySize?.message}
						disabled={isSubmitting}
						{...register("maxPartySize", {
							setValueAs: v => (v === "" ? undefined : Number(v)),
						})}
					/>
				</div>
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Теги и свойства</h3>

				<Input
					label="Теги (через запятую)"
					type="text"
					placeholder="Европа, Море, Премиум"
					value={tagsInput}
					onChange={e => setTagsInput(e.target.value)}
					disabled={isSubmitting}
					helperText="Введите теги через запятую"
				/>

				<Input
					label="Свойства (через запятую)"
					type="text"
					placeholder="7 дней и 6 ночей, Бутик-отель, Винные дегустации"
					value={propertiesInput}
					onChange={e => setPropertiesInput(e.target.value)}
					disabled={isSubmitting}
					helperText="Введите свойства через запятую"
				/>
			</div>

			<div className={s.section}>
				<label className={s.switch}>
					<input
						type="checkbox"
						{...register("available")}
						disabled={isSubmitting}
						className={s.switchInput}
					/>

					<span className={s.switchTrack}>
						<span className={s.switchThumb} />
					</span>

					<span className={s.switchLabel}>Тур доступен для бронирования</span>
				</label>
			</div>

			<div className={s.actions}>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
						className={s.cancelButton}
					>
						Отмена
					</button>
				)}
				<button
					type="submit"
					disabled={isSubmitting}
					className={s.submitButton}
				>
					{isSubmitting ? (
						<>
							<LoadingSpinner size="small" />
							<span>{isEditMode ? "Сохраняем..." : "Создаем..."}</span>
						</>
					) : isEditMode ? (
						"Сохранить изменения"
					) : (
						"Создать тур"
					)}
				</button>
			</div>
		</form>
	)
}
