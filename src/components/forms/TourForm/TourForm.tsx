"use client"

import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
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
import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react"
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
		watch,
	} = useForm<TourFormValues>({
		resolver: zodResolver(schema) as never,
		defaultValues: tour
			? ({
					title: tour.title,
					shortDescription: tour.shortDescription,
					fullDescriptionBlocks: tour.fullDescriptionBlocks ?? [],
					programText: tour.programText || "",
					price: tour.price,
					baseCurrency: tour.baseCurrency || "RUB",
					image: formatImageUrlForDisplay(tour.image),
					tags: tour.tags,
					categories: tour.categories,
					hasHotelOptions: tour.hasHotelOptions ?? false,
					hotels:
						tour.hotels?.map(hotel => ({
							name: hotel.name,
							stars: hotel.stars,
							note: hotel.note || "",
							basePrice: hotel.basePrice,
							baseCurrency: hotel.baseCurrency,
						})) ?? [],
					dateFrom: tour.dateFrom || "",
					dateTo: tour.dateTo || "",
					durationDays: tour.durationDays,
					durationNights: tour.durationNights,
					available: tour.available ?? true,
				} as TourUpdateInput & TourFormValues)
			: ({
					title: "",
					shortDescription: "",
					fullDescriptionBlocks: [],
					programText: "",
					price: 0,
					baseCurrency: "RUB",
					image: "",
					tags: [],
					categories: [],
					hasHotelOptions: false,
					hotels: [],
					dateFrom: "",
					dateTo: "",
					durationDays: undefined,
					durationNights: undefined,
					available: true,
				} as TourCreateInput & TourFormValues),
	})

	const imageField = register("image")
	const hasHotelOptions = watch("hasHotelOptions")

	const blockFieldsArray = useFieldArray({
		control,
		name: "fullDescriptionBlocks",
	})
	const hotelFieldsArray = useFieldArray({
		control,
		name: "hotels",
	})

	const blockSortableIds = blockFieldsArray.fields.map(field => field.id)

	const handleBlocksDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) return

		const activeIndex = blockFieldsArray.fields.findIndex(
			field => field.id === active.id,
		)
		const overIndex = blockFieldsArray.fields.findIndex(
			field => field.id === over.id,
		)

		if (activeIndex < 0 || overIndex < 0) return

		blockFieldsArray.move(activeIndex, overIndex)
	}

	useEffect(() => {
		const tags = tagsInput
			.split(",")
			.map(item => item.trim())
			.filter(Boolean)

		setValue("tags", tags)
	}, [setValue, tagsInput])

	useEffect(() => {
		const categories = categoriesInput
			.split(",")
			.map(item => item.trim())
			.filter(Boolean)

		setValue("categories", categories)
	}, [categoriesInput, setValue])

	const handleFormSubmit = async (data: TourFormValues) => {
		const cleanedBlocks = (data.fullDescriptionBlocks ?? [])
			.map(block => ({
				title: block.title?.trim?.() ?? "",
				items: (block.items ?? [])
					.map(item => item?.trim?.() ?? "")
					.filter(item => item.length > 0),
			}))
			.filter(block => block.title || block.items.length > 0)

		const cleanedHotels = (data.hotels ?? [])
			.map(hotel => ({
				name: hotel.name?.trim?.() ?? "",
				stars:
					hotel.stars === "" || hotel.stars === undefined
						? 0
						: Number(hotel.stars),
				note: hotel.note?.trim?.() || undefined,
				basePrice:
					hotel.basePrice === "" || hotel.basePrice === undefined
						? 0
						: Number(hotel.basePrice),
				baseCurrency: hotel.baseCurrency,
			}))
			.filter(hotel => hotel.name.length > 0 && hotel.basePrice > 0)

		const cleanedData = {
			...data,
			fullDescriptionBlocks: cleanedBlocks,
			programText: data.programText?.trim?.() || undefined,
			hasHotelOptions: Boolean(data.hasHotelOptions),
			hotels: data.hasHotelOptions ? cleanedHotels : [],
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

				<TextArea
					label="Программа тура"
					placeholder="Вставьте текст программы. Например: День 1: прилет..."
					rows={10}
					helperText="Фронт автоматически разобьет текст по дням, если найдет маркеры День 1 / 1 день / Day 1."
					error={errors.programText?.message}
					disabled={isSubmitting}
					{...register("programText")}
				/>

				<p className={s.blocksLabel}>Дополнительные блоки (legacy, опционально)</p>

				<div className={s.blocksContainer}>
					{blockFieldsArray.fields.length === 0 ? (
						<div className={s.blocksEmpty}>
							Дополнительных блоков пока нет. Этот раздел нужен только для
							нестандартных подпунктов.
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
									{blockFieldsArray.fields.map((field, index) => (
										<DescriptionBlockFields
											key={field.id}
											blockId={field.id}
											index={index}
											control={control}
											register={register}
											setValue={setValue}
											errors={errors}
											disabled={isSubmitting}
											canRemoveBlock={blockFieldsArray.fields.length > 1}
											onRemoveBlock={() => blockFieldsArray.remove(index)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}

					<button
						type="button"
						className={s.addBlockButton}
						onClick={() => blockFieldsArray.append({ title: "", items: [""] })}
						disabled={isSubmitting}
					>
						Добавить блок
					</button>
				</div>
			</div>

			<div className={s.section}>
				<h3 className={s.sectionTitle}>Цена и изображение</h3>

				<div className={s.row}>
					<Input
						label="Базовая цена"
						type="number"
						step="0.01"
						min="0.01"
						placeholder="0.00"
						error={errors.price?.message}
						disabled={isSubmitting}
						required
						{...register("price", { valueAsNumber: true })}
					/>

					<div className={s.selectWrapper}>
						<label className={s.selectLabel}>Валюта цены</label>
						<select
							className={s.nativeSelect}
							disabled={isSubmitting}
							{...register("baseCurrency")}
						>
							{SUPPORTED_CURRENCIES.map(currency => (
								<option key={currency} value={currency}>
									{currency}
								</option>
							))}
						</select>
					</div>
				</div>

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
				<h3 className={s.sectionTitle}>Отели по программе</h3>

				<label className={s.switch}>
					<input
						type="checkbox"
						{...register("hasHotelOptions")}
						disabled={isSubmitting}
						className={s.switchInput}
					/>

					<span className={s.switchTrack}>
						<span className={s.switchThumb} />
					</span>

					<span className={s.switchLabel}>Есть отели на выбор</span>
				</label>

				{hasHotelOptions ? (
					<div className={s.hotelList}>
						{hotelFieldsArray.fields.length === 0 ? (
							<div className={s.blocksEmpty}>
								Список пуст. Добавьте отели, которые клиент увидит на сайте.
							</div>
						) : (
							hotelFieldsArray.fields.map((field, index) => (
								<div key={field.id} className={s.hotelCard}>
									<div className={s.hotelCardHeader}>
										<h4 className={s.hotelCardTitle}>Отель #{index + 1}</h4>

										<button
											type="button"
											className={s.removeHotelButton}
											onClick={() => hotelFieldsArray.remove(index)}
											disabled={isSubmitting}
										>
											<Trash2 size={"1.6rem"} />
										</button>
									</div>

									<div className={s.hotelGrid}>
										<Input
											label="Название"
											error={errors.hotels?.[index]?.name?.message}
											disabled={isSubmitting}
											{...register(`hotels.${index}.name` as const)}
										/>

										<Input
											label="Звезды"
											type="number"
											min="1"
											max="5"
											error={errors.hotels?.[index]?.stars?.message}
											disabled={isSubmitting}
											{...register(`hotels.${index}.stars` as const, {
												setValueAs: v => (v === "" ? "" : Number(v)),
											})}
										/>

										<Input
											label="Цена"
											type="number"
											step="0.01"
											min="0.01"
											error={errors.hotels?.[index]?.basePrice?.message}
											disabled={isSubmitting}
											{...register(`hotels.${index}.basePrice` as const, {
												setValueAs: v => (v === "" ? "" : Number(v)),
											})}
										/>

										<div className={s.selectWrapper}>
											<label className={s.selectLabel}>Валюта</label>
											<select
												className={s.nativeSelect}
												disabled={isSubmitting}
												{...register(`hotels.${index}.baseCurrency` as const)}
											>
												{SUPPORTED_CURRENCIES.map(currency => (
													<option key={currency} value={currency}>
														{currency}
													</option>
												))}
											</select>
										</div>
									</div>

									<TextArea
										label="Комментарий к отелю"
										rows={3}
										error={errors.hotels?.[index]?.note?.message}
										disabled={isSubmitting}
										{...register(`hotels.${index}.note` as const)}
									/>
								</div>
							))
						)}

						<button
							type="button"
							className={s.addItemButton}
							onClick={() =>
								hotelFieldsArray.append({
									name: "",
									stars: "",
									note: "",
									basePrice: "",
									baseCurrency: "RUB",
								})
							}
							disabled={isSubmitting}
						>
							Добавить отель
						</button>
					</div>
				) : (
					<p className={s.helperText}>
						Если тур без выбора отелей, карточки отелей на сайте не показываются.
					</p>
				)}
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
