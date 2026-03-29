"use client"

import { DateInput } from "@/components/ui/Form/DateInput/DateInput"
import { Input } from "@/components/ui/Form/Input/Input"
import { TextArea } from "@/components/ui/Form/TextArea/TextArea"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner/LoadingSpinner"
import { TransitionLink } from "@/components/ui/PageTransition"
import { useCurrency } from "@/context/CurrencyContext"
import { useTourCart } from "@/context/TourCartContext"
import { useAuth } from "@/hooks/useAuth"
import {
	useCreateBookingOrder,
	useCreateTourCartLead,
} from "@/hooks/useBookingOrders"
import { useToast } from "@/hooks/useToast"
import { useTours } from "@/hooks/useTours"
import { CURRENCY_LOCALE } from "@/lib/currency"
import { formatCurrency as formatCurrencyValue } from "@/lib/format"
import {
	calculateTourCartLineTotal,
	getSelectedHotelSupplement,
	getTourAudiencePrice,
	getTourHotelAudienceSupplement,
} from "@/lib/tours"
import type { Participant, Tour } from "@/types"
import { ArrowRight, ShoppingCart, Trash2, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import s from "./page.module.scss"

type CheckoutParticipantDraft = {
	fullNameLatin: string
	birthDate: string
	gender: "male" | "female"
	passportNumber: string
	passportExpiresAt: string
	selectedHotelId?: string
}

type CheckoutItemDraft = {
	participants: CheckoutParticipantDraft[]
	notes: string
}

const CHECKOUT_STORAGE_KEY = "viva-tour-cart-checkout:v1"

const LATIN_NAME_REGEX = /^[A-Za-z][A-Za-z' -]*$/
const PASSPORT_REGEX = /^[A-Z0-9]+$/

const createParticipantDraft = (): CheckoutParticipantDraft => ({
	fullNameLatin: "",
	birthDate: "",
	gender: "male",
	passportNumber: "",
	passportExpiresAt: "",
	selectedHotelId: undefined,
})

export default function CartPage() {
	const router = useRouter()
	const { user, isAuthenticated, isLoading: authLoading } = useAuth()
	const { convertPrice, formatPrice, selectedCurrency } = useCurrency()
	const { showError } = useToast()
	const { items, isHydrated, updateItem, removeItem, clearCart } = useTourCart()
	const { tours, isLoading: toursLoading } = useTours()
	const createOrder = useCreateBookingOrder()
	const createLead = useCreateTourCartLead()

	const [checkoutState, setCheckoutState] = useState<
		Record<string, CheckoutItemDraft>
	>({})
	const [isCheckoutHydrated, setIsCheckoutHydrated] = useState(false)
	const [leadForm, setLeadForm] = useState({
		name: "",
		email: "",
		phone: "",
	})

	const canCheckout = user?.role === "CLIENT" || user?.role === "AGENT"

	useEffect(() => {
		if (typeof window === "undefined") return

		try {
			const rawValue = window.localStorage.getItem(CHECKOUT_STORAGE_KEY)

			if (!rawValue) {
				setIsCheckoutHydrated(true)
				return
			}

			const parsed = JSON.parse(rawValue) as Record<string, CheckoutItemDraft>

			if (parsed && typeof parsed === "object") {
				setCheckoutState(parsed)
			}
		} catch {
			window.localStorage.removeItem(CHECKOUT_STORAGE_KEY)
		} finally {
			setIsCheckoutHydrated(true)
		}
	}, [])

	const toursById = useMemo(() => {
		const map = new Map<string, Tour>()

		for (const tour of tours) {
			map.set(tour.id, tour)
			if (tour.publicId) {
				map.set(tour.publicId, tour)
			}
		}

		return map
	}, [tours])

	const cartEntries = useMemo(() => {
		return items
			.map(item => ({
				item,
				tour: toursById.get(item.tourPublicId ?? item.tourId),
			}))
			.filter((entry): entry is { item: (typeof items)[number]; tour: Tour } =>
				Boolean(entry.tour),
			)
	}, [items, toursById])

	useEffect(() => {
		if (!cartEntries.length) {
			setCheckoutState({})
			return
		}

		setCheckoutState(current => {
			const next = { ...current }

			for (const { item } of cartEntries) {
				const existing = current[item.id]
				const participants = Array.from(
					{ length: item.participantsCount },
					(_, index) =>
						existing?.participants[index] ?? createParticipantDraft(),
				)

				next[item.id] = {
					participants,
					notes: existing?.notes ?? item.note ?? "",
				}
			}

			for (const key of Object.keys(next)) {
				if (!cartEntries.some(entry => entry.item.id === key)) {
					delete next[key]
				}
			}

			return next
		})
	}, [cartEntries])

	useEffect(() => {
		if (!isCheckoutHydrated || typeof window === "undefined") return

		if (Object.keys(checkoutState).length === 0) {
			window.localStorage.removeItem(CHECKOUT_STORAGE_KEY)
			return
		}

		window.localStorage.setItem(
			CHECKOUT_STORAGE_KEY,
			JSON.stringify(checkoutState),
		)
	}, [checkoutState, isCheckoutHydrated])

	const estimatedTotal = useMemo(() => {
		return cartEntries.reduce((sum, { item, tour }) => {
			const checkoutItem = checkoutState[item.id]
			const lineTotal = calculateTourCartLineTotal(
				tour,
				user?.role,
				checkoutItem?.participants ?? item.participantsCount,
			)

			return sum + convertPrice(lineTotal, tour.baseCurrency)
		}, 0)
	}, [cartEntries, checkoutState, convertPrice, user?.role])

	const callbackUrl = "/cart"

	const updateParticipant = (
		itemId: string,
		index: number,
		patch: Partial<CheckoutParticipantDraft>,
	) => {
		setCheckoutState(current => ({
			...current,
			[itemId]: {
				...(current[itemId] ?? { participants: [], notes: "" }),
				participants: (current[itemId]?.participants ?? []).map(
					(participant, idx) =>
						idx === index
							? {
									...participant,
									...patch,
									passportNumber:
										patch.passportNumber !== undefined
											? patch.passportNumber.toUpperCase()
											: participant.passportNumber,
								}
							: participant,
				),
			},
		}))
	}

	const validateParticipant = (
		participant: CheckoutParticipantDraft,
		tour: Tour,
		index: number,
	) => {
		const orderIndex = index + 1

		if (!LATIN_NAME_REGEX.test(participant.fullNameLatin.trim())) {
			return `Участник ${orderIndex}: ФИО нужно указать латиницей.`
		}

		if (!participant.birthDate) {
			return `Участник ${orderIndex}: укажите дату рождения.`
		}

		if (!PASSPORT_REGEX.test(participant.passportNumber.trim().toUpperCase())) {
			return `Участник ${orderIndex}: номер паспорта должен быть латиницей и цифрами.`
		}

		if (!participant.passportExpiresAt) {
			return `Участник ${orderIndex}: укажите срок действия паспорта.`
		}

		if (new Date(participant.passportExpiresAt).getTime() <= Date.now()) {
			return `Участник ${orderIndex}: срок действия паспорта должен быть позже текущей даты.`
		}

		if (tour.hasHotelOptions && !participant.selectedHotelId) {
			return `Участник ${orderIndex}: выберите отель.`
		}

		return null
	}

	const handleSubmitOrder = async () => {
		if (!canCheckout) return
		if (!cartEntries.length) return

		for (const { item, tour } of cartEntries) {
			const checkoutItem = checkoutState[item.id]

			if (
				!checkoutItem ||
				checkoutItem.participants.length !== item.participantsCount
			) {
				showError(
					"Корзина еще не готова к отправке. Обновите количество участников.",
				)
				return
			}

			for (const [index, participant] of checkoutItem.participants.entries()) {
				const validationError = validateParticipant(participant, tour, index)

				if (validationError) {
					showError(validationError)
					return
				}
			}
		}

		const order = await createOrder.mutateAsync({
			items: cartEntries.map(({ item, tour }) => ({
				tourId: tour.publicId ?? tour.id,
				notes: checkoutState[item.id]?.notes?.trim() || item.note || undefined,
				participants: checkoutState[item.id]!.participants.map<Participant>(
					participant => ({
						fullName: participant.fullNameLatin.trim(),
						fullNameLatin: participant.fullNameLatin.trim(),
						birthDate: participant.birthDate,
						gender: participant.gender,
						passportNumber: participant.passportNumber.trim().toUpperCase(),
						passportExpiresAt: participant.passportExpiresAt,
						selectedHotelId: participant.selectedHotelId || undefined,
					}),
				),
			})),
		})

		clearCart()
		router.push(`/client/tours/booking/${order.publicId}`)
	}

	const handleSubmitLead = async () => {
		if (!cartEntries.length) return

		if (!leadForm.name.trim() || !leadForm.email.trim()) {
			showError("Для быстрой заявки укажите имя и email.")
			return
		}

		try {
			await createLead.mutateAsync({
				name: leadForm.name.trim(),
				email: leadForm.email.trim(),
				phone: leadForm.phone.trim() || undefined,
				items: cartEntries.map(({ item, tour }) => ({
					tourId: tour.publicId ?? tour.id,
					participantsCount: item.participantsCount,
					note: item.note,
				})),
			})
		} catch (error) {
			if (error instanceof Error) {
				showError(error.message)
			}
		}
	}

	if (!isHydrated || !isCheckoutHydrated || toursLoading || authLoading) {
		return (
			<div className={s.shell}>
				<LoadingSpinner fullScreen text="Подготавливаем корзину..." />
			</div>
		)
	}

	return (
		<div className={s.shell}>
			<div className={s.header}>
				<div>
					<p className={s.eyebrow}>Tour Checkout</p>
					<h1 className={s.title}>Корзина туров</h1>
					<p className={s.lead}>
						Сначала соберите корзину, затем либо отправьте полноценный заказ из
						личного кабинета, либо оставьте быстрый lead без входа.
					</p>
				</div>

				<div className={s.summaryPill}>
					<ShoppingCart size={"1.8rem"} />
					<span>{items.length} поз.</span>
				</div>
			</div>

			{!items.length ? (
				<div className={s.emptyState}>
					<h2>Корзина пока пустая</h2>
					<p>Добавьте туры с витрины или из личного кабинета.</p>
					<TransitionLink href="/tours" className={s.primaryLink}>
						Перейти к турам
					</TransitionLink>
				</div>
			) : (
				<div className={s.layout}>
					<div className={s.items}>
						{cartEntries.map(({ item, tour }) => {
							const checkoutItem = checkoutState[item.id]
							const pricePerTraveler = getTourAudiencePrice(tour, user?.role)

							return (
								<section key={item.id} className={s.card}>
									<div className={s.cardHeader}>
										<div>
											<p className={s.cardKicker}>
												{tour.hasHotelOptions
													? "Есть выбор отеля на каждого участника"
													: "Тур без hotel supplements"}
											</p>
											<h2 className={s.cardTitle}>{tour.title}</h2>
											<p className={s.cardText}>{tour.shortDescription}</p>
										</div>

										<button
											type="button"
											className={s.removeButton}
											onClick={() => removeItem(item.id)}
										>
											<Trash2 size={"1.6rem"} />
											<span>Убрать</span>
										</button>
									</div>

									<div className={s.cardMeta}>
										<label className={s.counter}>
											<span>Участников</span>
											<input
												type="number"
												min="1"
												value={item.participantsCount}
												onChange={event =>
													updateItem(item.id, {
														participantsCount: Number(event.target.value) || 1,
													})
												}
											/>
										</label>

										<div className={s.priceBox}>
											<span>База за человека</span>
											<strong>
												{formatPrice(pricePerTraveler, tour.baseCurrency)}
											</strong>
										</div>
									</div>

									<TextArea
										label="Комментарий к позиции"
										placeholder="Например: нужен ранний вылет или отдельный номер"
										rows={3}
										value={checkoutItem?.notes ?? item.note ?? ""}
										onChange={event => {
											updateItem(item.id, {
												note: event.target.value,
											})
											setCheckoutState(current => ({
												...current,
												[item.id]: {
													participants:
														current[item.id]?.participants ??
														Array.from({ length: item.participantsCount }, () =>
															createParticipantDraft(),
														),
													notes: event.target.value,
												},
											}))
										}}
									/>

									{canCheckout && checkoutItem ? (
										<div className={s.participantsBlock}>
											<div className={s.blockHeader}>
												<h3>Паспортные данные и отели</h3>
												<p>
													ФИО обязательно указывать латиницей ровно так, как в
													загранпаспорте.
												</p>
											</div>

											<div className={s.participantsList}>
												{checkoutItem.participants.map((participant, index) => (
													<div
														key={`${item.id}-${index}`}
														className={s.participantCard}
													>
														<div className={s.participantHeader}>
															<UserRound size={"1.8rem"} />
															<span>Участник {index + 1}</span>
														</div>

														<div className={s.formGrid}>
															<Input
																label="ФИО латиницей"
																placeholder="IVANOV IVAN"
																value={participant.fullNameLatin}
																onChange={event =>
																	updateParticipant(item.id, index, {
																		fullNameLatin: event.target.value,
																	})
																}
															/>

															<Input
																label="Номер паспорта"
																placeholder="72A123456"
																value={participant.passportNumber}
																onChange={event =>
																	updateParticipant(item.id, index, {
																		passportNumber: event.target.value,
																	})
																}
															/>

															<DateInput
																label="Дата рождения"
																value={participant.birthDate}
																onChange={event =>
																	updateParticipant(item.id, index, {
																		birthDate: event.target.value,
																	})
																}
															/>

															<DateInput
																label="Паспорт действует до"
																value={participant.passportExpiresAt}
																onChange={event =>
																	updateParticipant(item.id, index, {
																		passportExpiresAt: event.target.value,
																	})
																}
															/>

															<div className={s.selectField}>
																<label>Пол</label>
																<select
																	value={participant.gender}
																	onChange={event =>
																		updateParticipant(item.id, index, {
																			gender: event.target.value as
																				| "male"
																				| "female",
																		})
																	}
																>
																	<option value="male">Мужской</option>
																	<option value="female">Женский</option>
																</select>
															</div>

															{tour.hasHotelOptions ? (
																<div className={s.selectField}>
																	<label>Отель для участника</label>
																	<select
																		value={participant.selectedHotelId ?? ""}
																		onChange={event =>
																			updateParticipant(item.id, index, {
																				selectedHotelId:
																					event.target.value || undefined,
																			})
																		}
																	>
																		<option value="">Выберите отель</option>
																		{tour.hotels.map(hotel => (
																			<option key={hotel.id} value={hotel.id}>
																				{hotel.name} · +
																				{formatPrice(
																					getTourHotelAudienceSupplement(
																						hotel,
																						user?.role,
																					),
																					hotel.baseCurrency,
																				)}
																			</option>
																		))}
																	</select>
																</div>
															) : (
																<div className={s.inlinePrice}>
																	<span>Доплата по отелю</span>
																	<strong>Не требуется</strong>
																</div>
															)}
														</div>

														<div className={s.participantTotal}>
															<span>Итог по участнику</span>
															<strong>
																{formatPrice(
																	pricePerTraveler +
																		getSelectedHotelSupplement(
																			tour,
																			participant.selectedHotelId,
																			user?.role,
																		),
																	tour.baseCurrency,
																)}
															</strong>
														</div>
													</div>
												))}
											</div>
										</div>
									) : (
										<div className={s.guestNote}>
											Для быстрого guest lead сохраняем только состав корзины.
											Паспортные данные понадобятся после входа в кабинет.
										</div>
									)}
								</section>
							)
						})}
					</div>

					<aside className={s.sidebar}>
						<div className={s.sidebarCard}>
							<p className={s.sidebarLabel}>Итог по корзине</p>
							<h2 className={s.sidebarTotal}>
								{formatCurrencyValue(
									estimatedTotal,
									selectedCurrency,
									CURRENCY_LOCALE[selectedCurrency],
								)}
							</h2>

							{canCheckout ? (
								<button
									type="button"
									className={s.primaryButton}
									onClick={handleSubmitOrder}
									disabled={createOrder.isPending || !cartEntries.length}
								>
									<span>
										{createOrder.isPending
											? "Отправляем заказ..."
											: "Отправить заказ"}
									</span>
									<ArrowRight size={"1.6rem"} />
								</button>
							) : (
								<div className={s.authActions}>
									<TransitionLink
										href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
										className={s.primaryLink}
									>
										Войти и оформить
									</TransitionLink>
									<TransitionLink
										href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
										className={s.secondaryLink}
									>
										Регистрация с возвратом в корзину
									</TransitionLink>
								</div>
							)}
						</div>

						{!isAuthenticated && (
							<div className={s.sidebarCard}>
								<p className={s.sidebarLabel}>Быстрая заявка без входа</p>
								<h3 className={s.sidebarSubhead}>Guest lead</h3>
								<Input
									label="Имя"
									value={leadForm.name}
									onChange={event =>
										setLeadForm(current => ({
											...current,
											name: event.target.value,
										}))
									}
								/>
								<Input
									label="Email"
									type="email"
									value={leadForm.email}
									onChange={event =>
										setLeadForm(current => ({
											...current,
											email: event.target.value,
										}))
									}
								/>
								<Input
									label="Телефон"
									value={leadForm.phone}
									onChange={event =>
										setLeadForm(current => ({
											...current,
											phone: event.target.value,
										}))
									}
								/>
								<button
									type="button"
									className={s.secondaryButton}
									onClick={handleSubmitLead}
									disabled={createLead.isPending || !cartEntries.length}
								>
									{createLead.isPending
										? "Отправляем..."
										: "Отправить быстрый lead"}
								</button>
							</div>
						)}
					</aside>
				</div>
			)}

			{items.length > 0 && cartEntries.length !== items.length && (
				<p className={s.warningText}>
					Часть туров из корзины сейчас не найдена в актуальной витрине.
					Проверьте их вручную или очистите устаревшие позиции.
				</p>
			)}
		</div>
	)
}
