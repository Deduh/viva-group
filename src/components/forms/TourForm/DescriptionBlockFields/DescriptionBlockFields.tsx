"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { TourFormValues } from "@/types/forms"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	useWatch,
	type Control,
	type FieldErrors,
	type UseFormRegister,
	type UseFormSetValue,
} from "react-hook-form"
import s from "../TourForm.module.scss"

type DescriptionBlockFieldsProps = {
	blockId: string
	index: number
	control: Control<TourFormValues>
	register: UseFormRegister<TourFormValues>
	setValue: UseFormSetValue<TourFormValues>
	errors: FieldErrors<TourFormValues>
	disabled: boolean
	canRemoveBlock: boolean
	onRemoveBlock: () => void
}

type SortableItemRowProps = {
	itemId: string
	itemIndex: number
	index: number
	disabled: boolean
	register: UseFormRegister<TourFormValues>
	removeItem: (index: number) => void
	itemCount: number
	blockErrors: FieldErrors<TourFormValues>["fullDescriptionBlocks"]
}

function SortableItemRow({
	itemId,
	itemIndex,
	index,
	disabled,
	register,
	removeItem,
	itemCount,
	blockErrors,
}: SortableItemRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: itemId })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}
	const handleProps = disabled ? {} : { ...attributes, ...listeners }

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`${s.itemRow} ${isDragging ? s.itemDragging : ""}`}
		>
			<div className={s.itemInputWrap}>
				<button
					type="button"
					className={s.dragHandle}
					{...handleProps}
					aria-label={`Перетащить пункт ${itemIndex + 1}`}
				>
					<GripVertical size={"1.4rem"} />
				</button>

				<Input
					type="text"
					placeholder={`Пункт ${itemIndex + 1}`}
					disabled={disabled}
					error={
						(blockErrors?.[index]?.items?.[itemIndex] as { message?: string })
							?.message
					}
					{...register(
						`fullDescriptionBlocks.${index}.items.${itemIndex}` as const,
					)}
				/>
			</div>

			<button
				type="button"
				className={s.removeItemButton}
				onClick={() => removeItem(itemIndex)}
				disabled={disabled || itemCount <= 1}
			>
				<X className={s.removeItemButtonIcon} strokeWidth={4} />
			</button>
		</div>
	)
}

export function DescriptionBlockFields({
	blockId,
	index,
	control,
	register,
	setValue,
	errors,
	disabled,
	canRemoveBlock,
	onRemoveBlock,
}: DescriptionBlockFieldsProps) {
	const itemsPath = `fullDescriptionBlocks.${index}.items` as const
	const items = useWatch({ control, name: itemsPath }) ?? []
	const idCounterRef = useRef(0)
	const makeId = useCallback(
		() => `block-${index}-item-${idCounterRef.current++}`,
		[index],
	)
	const [itemIds, setItemIds] = useState<string[]>(() =>
		items.map(() => makeId()),
	)

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: blockId })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}
	const dragHandleProps = disabled ? {} : { ...attributes, ...listeners }
	const blockErrors = errors.fullDescriptionBlocks

	useEffect(() => {
		if (items.length === 0) {
			setValue(itemsPath, [""], { shouldDirty: true, shouldTouch: true })

			setItemIds([makeId()])
		}
	}, [items.length, itemsPath, makeId, setValue])

	useEffect(() => {
		setItemIds(prev => {
			if (items.length === 0) return []

			if (prev.length === items.length) return prev

			const next = prev.slice(0, items.length)

			while (next.length < items.length) next.push(makeId())

			return next
		})
	}, [items.length, makeId])

	const arrayMove = <T,>(arr: T[], from: number, to: number) => {
		const copy = [...arr]
		const [moved] = copy.splice(from, 1)

		copy.splice(to, 0, moved)

		return copy
	}

	const handleItemsDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) return

		const activeIndex = itemIds.findIndex(id => id === active.id)
		const overIndex = itemIds.findIndex(id => id === over.id)

		if (activeIndex < 0 || overIndex < 0) return

		setValue(itemsPath, arrayMove(items, activeIndex, overIndex), {
			shouldDirty: true,
			shouldTouch: true,
		})
		setItemIds(prev => arrayMove(prev, activeIndex, overIndex))
	}

	const handleAddItem = () => {
		setValue(itemsPath, [...items, ""], {
			shouldDirty: true,
			shouldTouch: true,
		})
		setItemIds(prev => [...prev, makeId()])
	}

	const handleRemoveItem = (itemIndex: number) => {
		if (items.length <= 1) return

		setValue(
			itemsPath,
			items.filter((_, idx) => idx !== itemIndex),
			{ shouldDirty: true, shouldTouch: true },
		)
		setItemIds(prev => prev.filter((_, idx) => idx !== itemIndex))
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`${s.blockCard} ${isDragging ? s.blockDragging : ""}`}
		>
			<div className={s.blockHeader}>
				<div className={s.blockTitleGroup}>
					<button
						type="button"
						className={s.dragHandle}
						{...dragHandleProps}
						aria-label={`Перетащить блок ${index + 1}`}
					>
						<GripVertical size={"1.6rem"} />
					</button>

					<div className={s.blockTitle}>Блок #{index + 1}</div>
				</div>

				<button
					type="button"
					className={s.removeBlockButton}
					onClick={onRemoveBlock}
					disabled={disabled || !canRemoveBlock}
				>
					<X className={s.removeBlockButtonIcon} strokeWidth={4} />
				</button>
			</div>

			<Input
				label="Заголовок блока"
				type="text"
				placeholder="Например: Что включено"
				error={blockErrors?.[index]?.title?.message as string | undefined}
				disabled={disabled}
				{...register(`fullDescriptionBlocks.${index}.title` as const)}
			/>

			<div className={s.itemsSection}>
				<span className={s.itemsTitle}>Пункты списка</span>

				{items.length === 0 ? (
					<p className={s.itemsEmpty}>Добавьте хотя бы один пункт</p>
				) : (
					<DndContext
						collisionDetection={closestCenter}
						onDragEnd={handleItemsDragEnd}
					>
						<SortableContext
							items={itemIds}
							strategy={verticalListSortingStrategy}
						>
							<div className={s.itemsList}>
								{itemIds.map((itemId, itemIndex) => (
									<SortableItemRow
										key={itemId}
										itemId={itemId}
										itemIndex={itemIndex}
										index={index}
										disabled={disabled}
										register={register}
										removeItem={handleRemoveItem}
										itemCount={items.length}
										blockErrors={blockErrors}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				)}

				<button
					type="button"
					className={s.addItemButton}
					onClick={handleAddItem}
					disabled={disabled}
				>
					Добавить пункт
				</button>
			</div>
		</div>
	)
}
