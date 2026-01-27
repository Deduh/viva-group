"use client"

import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
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
import { TourFormValues } from "@/types/forms"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { zodResolver } from "@hookform/resolvers/zod"
import { Image as ImageIcon, Loader2 } from "lucide-react"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { DescriptionBlockFields } from "./DescriptionBlockFields/DescriptionBlockFields"
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
	const [categoriesInput, setCategoriesInput] = useState(
		tour?.categories.join(", ") || "",
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
		control,
	} = useForm<TourFormValues>({
		resolver: zodResolver(schema) as never,
		defaultValues: tour
			? ({
					title: tour.title,
					shortDescription: tour.shortDescription,
					fullDescriptionBlocks:
						tour.fullDescriptionBlocks.length > 0
							? tour.fullDescriptionBlocks
							: [{ title: "", items: [""] }],
					price: tour.price,
					image: formatImageUrlForDisplay(tour.image),
					tags: tour.tags,
					categories: tour.categories,
					dateFrom: tour.dateFrom || "",
					dateTo: tour.dateTo || "",
					durationDays: tour.durationDays,
					durationNights: tour.durationNights,
					available: tour.available ?? true,
				} as TourUpdateInput)
			: ({
					title: "",
					shortDescription: "",
					fullDescriptionBlocks: [{ title: "", items: [""] }],
					price: 0,
					image: "",
					tags: [],
					categories: [],
					dateFrom: "",
					dateTo: "",
					durationDays: undefined,
					durationNights: undefined,
					available: true,
				} as TourCreateInput),
	})

	const imageField = register("image")

	const blocksFieldArray = useFieldArray({
		control,
		name: "fullDescriptionBlocks",
	})
	const {
		fields: blockFields,
		append: appendBlock,
		remove: removeBlock,
		move: moveBlock,
	} = blocksFieldArray
	const blockSortableIds = blockFields.map(field => field.id)

	const handleBlocksDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) return

		const activeIndex = blockFields.findIndex(field => field.id === active.id)
		const overIndex = blockFields.findIndex(field => field.id === over.id)

		if (activeIndex < 0 || overIndex < 0) return

		moveBlock(activeIndex, overIndex)
	}

	useEffect(() => {
		if (blockFields.length === 0) {
			appendBlock({ title: "", items: [""] })
		}
	}, [blockFields.length, appendBlock])

	useEffect(() => {
		const tags = tagsInput
			.split(",")
			.map(t => t.trim())
			.filter(t => t.length > 0)

		setValue("tags", tags)
	}, [tagsInput, setValue])

	useEffect(() => {
		const categories = categoriesInput
			.split(",")
			.map(item => item.trim())
			.filter(item => item.length > 0)

		setValue("categories", categories)
	}, [categoriesInput, setValue])

	const handleFormSubmit = async (data: TourFormValues) => {
		const cleanedBlocks = (data.fullDescriptionBlocks ?? []).map(block => ({
			title: block.title?.trim?.() ?? "",
			items: (block.items ?? [])
				.map(item => item?.trim?.() ?? "")
				.filter(item => item.length > 0),
		}))

		const cleanedData = {
			...data,
			fullDescriptionBlocks: cleanedBlocks,
			dateFrom: data.dateFrom === "" ? undefined : data.dateFrom,
			dateTo: data.dateTo === "" ? undefined : data.dateTo,
			durationDays:
				data.durationDays === "" || data.durationDays === undefined
					? undefined
					: Number(data.durationDays),
			durationNights:
				data.durationNights === "" || data.durationNights === undefined
					? undefined
					: Number(data.durationNights),
		}

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
					label="Название тура"
					type="text"
					placeholder="Например: Санторини, Греция"
					error={errors.title?.message}
					disabled={isSubmitting}
					required
					{...register("title")}
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

				<p className={s.blocksLabel}>
					Полное описание (блоки)
					<span className={s.required}>*</span>
				</p>

				<div className={s.blocksContainer}>
					{blockFields.length === 0 ? (
						<div className={s.blocksEmpty}>
							Пока нет блоков. Добавьте первый блок описания.
						</div>
					) : (
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={handleBlocksDragEnd}
						>
							<SortableContext
								items={blockSortableIds}
								strategy={verticalListSortingStrategy}
							>
								<div className={s.blocksList}>
									{blockFields.map((field, index) => (
										<DescriptionBlockFields
											key={field.id}
											blockId={field.id}
											index={index}
											control={control}
											register={register}
											setValue={setValue}
											errors={errors}
											disabled={isSubmitting}
											canRemoveBlock={blockFields.length > 1}
											onRemoveBlock={() => removeBlock(index)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}

					<button
						type="button"
						className={s.addBlockButton}
						onClick={() => appendBlock({ title: "", items: [""] })}
						disabled={isSubmitting}
					>
						Добавить блок
					</button>

					{errors.fullDescriptionBlocks?.message && (
						<p className={s.errorText}>
							{errors.fullDescriptionBlocks.message as string}
						</p>
					)}
				</div>
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
				<h3 className={s.sectionTitle}>Даты и длительность</h3>

				<div className={s.row}>
					<DateInput
						label="Дата начала"
						error={errors.dateFrom?.message}
						disabled={isSubmitting}
						{...register("dateFrom")}
					/>

					<DateInput
						label="Дата окончания"
						error={errors.dateTo?.message}
						disabled={isSubmitting}
						{...register("dateTo")}
					/>
				</div>

				<div className={s.row}>
					<Input
						label="Длительность (дни)"
						type="number"
						min="1"
						placeholder="Например: 7"
						error={errors.durationDays?.message}
						disabled={isSubmitting}
						{...register("durationDays", {
							setValueAs: v => (v === "" ? undefined : Number(v)),
						})}
					/>

					<Input
						label="Длительность (ночи)"
						type="number"
						min="1"
						placeholder="Например: 6"
						error={errors.durationNights?.message}
						disabled={isSubmitting}
						{...register("durationNights", {
							setValueAs: v => (v === "" ? undefined : Number(v)),
						})}
					/>
				</div>
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Теги</h3>

				<Input
					label="Теги (через запятую)"
					type="text"
					placeholder="Европа, Море, Премиум"
					value={tagsInput}
					onChange={e => setTagsInput(e.target.value)}
					disabled={isSubmitting}
					helperText="Введите теги через запятую"
				/>
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Категории</h3>

				<Input
					label="Категории (для фильтрации)"
					type="text"
					placeholder="Европа, Азия"
					value={categoriesInput}
					onChange={e => setCategoriesInput(e.target.value)}
					disabled={isSubmitting}
					helperText="Введите категории через запятую"
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
