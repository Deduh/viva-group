import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/api"
import type { ApiCollection } from "@/types"
import type { BookingStatus } from "@/types/enums"
import type { GroupTransportBooking } from "@/types/group-transport"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
	Check,
	Footprints,
	Plus,
	RussianRuble,
	UsersRound,
	X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import s from "./ClientGroupTransportForm.module.scss"
import {
	createSegment,
	normalizeSegment,
	type FormValues,
	type Segment,
} from "./ClientGroupTransportForm.utils"

export function ClientGroupTransportForm() {
	const queryClient = useQueryClient()
	const { showSuccess, showError } = useToast()
	const { user } = useAuth()
	const router = useRouter()
	const passengerFieldOptions = {
		setValueAs: (value: string) => {
			if (value === "") return undefined
			const numeric = Number(value)
			return Number.isNaN(numeric) ? undefined : numeric
		},
	}
	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { isSubmitting, errors },
	} = useForm<FormValues>({
		defaultValues: {
			segments: [createSegment()],
			note: "",
		},
	})

	const { fields, append, remove } = useFieldArray({
		name: "segments",
		control,
	})

	const createBooking = useMutation({
		mutationFn: (values: FormValues) => api.createGroupTransportBooking(values),
		onMutate: async values => {
			await queryClient.cancelQueries({
				queryKey: ["groupTransportBookings"],
			})

			const previous = queryClient.getQueryData<
				ApiCollection<GroupTransportBooking>
			>(["groupTransportBookings"])

			const optimisticId = `temp-${Date.now()}`
			const optimisticBooking: GroupTransportBooking = {
				id: optimisticId,
				userId: user?.id || "temp",
				status: "PENDING" as BookingStatus,
				createdAt: new Date().toISOString(),
				note: values.note?.trim() || undefined,
				segments: values.segments.map(normalizeSegment),
			}

			queryClient.setQueryData<ApiCollection<GroupTransportBooking>>(
				["groupTransportBookings"],
				old => {
					const items = old?.items
						? [optimisticBooking, ...old.items]
						: [optimisticBooking]
					const total =
						typeof old?.total === "number" ? old.total + 1 : old?.total

					return {
						...(old || { items }),
						items,
						total,
					}
				}
			)

			return { previous, optimisticId }
		},
		onSuccess: (createdBooking, _values, context) => {
			queryClient.setQueryData<ApiCollection<GroupTransportBooking>>(
				["groupTransportBookings"],
				old => {
					if (!old) {
						return { items: [createdBooking] }
					}

					let replaced = false
					const items = old.items.map(item => {
						if (item.id === context?.optimisticId) {
							replaced = true
							return createdBooking
						}

						return item
					})

					return {
						...old,
						items: replaced ? items : [createdBooking, ...items],
					}
				}
			)

			reset({ segments: [createSegment()], note: "" })
			showSuccess("Заявка на групповую перевозку отправлена!")
			router.push(`/client/group-transport/booking/${createdBooking.id}`)
		},
		onError: (error: Error, _values, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["groupTransportBookings"], context.previous)
			}
			console.error("Ошибка создания заявки на перевозку:", error)
			showError(
				error.message || "Не удалось отправить заявку. Попробуйте снова."
			)
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["groupTransportBookings"] })
		},
	})

	const handleAddDirection = (direction: Segment["direction"]) => {
		append(createSegment(direction))
	}

	const onSubmit = async (values: FormValues) => {
		if (createBooking.isPending) return

		try {
			await createBooking.mutateAsync(values)
		} catch {
			// ошибки обрабатываются в onError мутации
		}
	}

	const isBusy = isSubmitting || createBooking.isPending

	return (
		<div className={s.container}>
			<div className={s.description}>
				<h2 className={s.title}>Групповые перевозки</h2>

				<p className={s.text}>
					Формирование сложного маршрута для групп от 10 человек.
				</p>
			</div>

			<div className={s.content}>
				<form className={s.form} onSubmit={handleSubmit(onSubmit)}>
					<div className={s.formWrapper}>
						{fields.map((field, index) => {
							const isFirst = index === 0
							const direction = isFirst ? "forward" : field.direction
							const isReturn = direction === "return"
							const segmentErrors = errors.segments?.[index]

							return (
								<div key={field.id} className={s.formTop}>
									<input
										type="hidden"
										value={direction}
										{...register(`segments.${index}.direction`)}
									/>

									<div className={s.formTopClose}>
										<button
											type="button"
											className={s.formTopCloseButton}
											onClick={() => remove(index)}
											disabled={fields.length === 1 || isBusy}
											aria-label="Удалить направление"
										>
											<X className={s.formTopCloseButtonIcon} strokeWidth={4} />
										</button>
									</div>

									<div>
										<div className={s.formTopHeader}>
											<div className={s.formTopHeaderInput}>
												<span
													className={`${s.formTopHeaderInputLabel} ${s.required}`}
												>
													{isReturn ? "Дата обратного вылета" : "Дата вылета"}
												</span>

												<Input
													type="date"
													{...register(`segments.${index}.departureDate`, {
														required: "Укажите дату вылета",
													})}
													error={segmentErrors?.departureDate?.message}
												/>
											</div>

											<div className={s.formTopHeaderInput}>
												<span className={s.formTopHeaderInputLabel}>
													Рейс U6
												</span>

												<Input
													type="number"
													placeholder="Номер"
													{...register(`segments.${index}.flightNumber`)}
												/>
											</div>

											<div className={s.formTopHeaderInput}>
												<span
													className={`${s.formTopHeaderInputLabel} ${s.required}`}
												>
													Откуда
												</span>

												<Input
													type="text"
													placeholder={
														isReturn ? "Город возврата" : "Город вылета"
													}
													{...register(`segments.${index}.from`, {
														required: "Укажите город отправления",
													})}
													error={segmentErrors?.from?.message}
												/>
											</div>

											<div className={s.formTopHeaderInput}>
												<span
													className={`${s.formTopHeaderInputLabel} ${s.required}`}
												>
													Куда
												</span>

												<Input
													type="text"
													placeholder={
														isReturn ? "Город прибытия" : "Город прибытия"
													}
													{...register(`segments.${index}.to`, {
														required: "Укажите город прибытия",
													})}
													error={segmentErrors?.to?.message}
												/>
											</div>
										</div>

										<div className={s.formTopBody}>
											<div className={s.formTopBodyWrapper}>
												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Пенсионеры эко.
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.seniorsEco`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Взрослые эконом
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.adultsEco`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Молодёжь эконом
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.youthEco`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Дети эконом
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.childrenEco`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Младенцы эконом
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.infantsEco`,
															passengerFieldOptions
														)}
													/>
												</div>
											</div>

											<div className={s.formTopBodyWrapper}>
												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Пенсионеры биз.
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.seniorsBusiness`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Взрослые бизнес
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.adultsBusiness`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Молодёжь бизнес
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.youthBusiness`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Дети бизнес
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.childrenBusiness`,
															passengerFieldOptions
														)}
													/>
												</div>

												<div className={s.formTopBodyInput}>
													<span className={s.formTopBodyInputLabel}>
														Младенцы бизнес
													</span>

													<Input
														type="number"
														placeholder="0"
														{...register(
															`segments.${index}.passengers.infantsBusiness`,
															passengerFieldOptions
														)}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							)
						})}

						<div className={s.formBottom}>
							<div className={s.formBottomButtons}>
								<button
									type="button"
									className={s.formBottomButton}
									onClick={() => handleAddDirection("return")}
									disabled={isBusy}
								>
									Добавить обратное направление
								</button>

								<button
									type="button"
									className={s.formBottomButton}
									onClick={() => handleAddDirection("forward")}
									disabled={isBusy}
								>
									<Plus className={s.formBottomButtonIcon} strokeWidth={4} />

									<span>Добавить направление</span>
								</button>
							</div>

							<div className={s.formBottomNote}>
								<span className={s.formBottomNoteLabel}>
									Примечание к заказу
								</span>

								<TextArea
									placeholder="Введите примечание..."
									{...register("note")}
								/>
							</div>
						</div>
					</div>

					<button className={s.button} type="submit" disabled={isBusy}>
						<Check className={s.buttonIcon} strokeWidth={4} />

						<span>{isBusy ? "Отправляем..." : "Забронировать"}</span>
					</button>
				</form>

				<div className={s.cards}>
					<div className={s.card}>
						<div className={s.cardTitle}>
							<UsersRound className={s.cardIcon} strokeWidth={3} />

							<span className={s.cardLabel}>Возрастные группы</span>
						</div>

						<div className={s.cardContent}>
							<div className={s.cardContentContainer}>
								<div className={s.cardContentItem}>
									<span>Пенсионеры:</span>

									<span>Ж 55+, М 60+</span>
								</div>

								<div className={s.cardContentItem}>
									<span>Взрослые:</span>

									<span>23+ лет</span>
								</div>

								<div className={s.cardContentItem}>
									<span>Молодёжь:</span>

									<span>12 - 22 лет</span>
								</div>

								<div className={s.cardContentItem}>
									<span>Дети:</span>

									<span>2 - 11 лет</span>
								</div>

								<div className={s.cardContentItem}>
									<span>Младенцы:</span>

									<span>0 - 1 год</span>
								</div>
							</div>
						</div>
					</div>

					<div className={s.card}>
						<div className={s.cardTitle}>
							<Footprints className={s.cardIcon} strokeWidth={3} />

							<span className={s.cardLabel}>Сопровождение</span>
						</div>

						<div className={s.cardContent}>
							<p className={s.cardContentText}>
								При перевозке группы детей (2–14 лет) обязателен{" "}
								<span>1 сопровождающий</span> на каждые 10 человек.
							</p>
						</div>
					</div>

					<div className={s.card}>
						<div className={s.cardTitle}>
							<RussianRuble className={s.cardIcon} strokeWidth={3} />

							<span className={s.cardLabel}>Субсидии (ДВ)</span>
						</div>

						<div className={s.cardContent}>
							<span className={s.cardContentLabel}>
								Постановление РФ № 2478. Лимит: 4 договора на пассажира.
							</span>

							<ul className={s.cardList}>
								<li className={s.cardListItem}>
									Не более 4 билетов &quot;в одну сторону&quot;
								</li>

								<li className={s.cardListItem}>
									Или 2 билета &quot;туда-обратно&quot;
								</li>

								<li className={s.cardListItem}>
									Или 2 &quot;в одну&quot; + 1 &quot;туда-обратно&quot;
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
