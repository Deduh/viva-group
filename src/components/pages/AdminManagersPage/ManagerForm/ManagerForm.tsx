"use client"

import { Input } from "@/components/ui/Form/Input/Input"
import { formatPhoneNumber } from "@/lib/format"
import type { CreateManagerInput, User } from "@/types"
import { Sparkles } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import s from "./ManagerForm.module.scss"

type ManagerFormValues = CreateManagerInput & {
	status?: "active" | "blocked"
	role?: "MANAGER" | "ADMIN"
}

interface ManagerFormProps {
	manager?: User
	onSubmit: (data: ManagerFormValues) => Promise<void> | void
	onCancel?: () => void
	isSubmitting?: boolean
}

export function ManagerForm({
	manager,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: ManagerFormProps) {
	const isEdit = !!manager
	const defaultRole: ManagerFormValues["role"] =
		manager?.role === "ADMIN" ? "ADMIN" : "MANAGER"

	const {
		register,
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<ManagerFormValues>({
		defaultValues: {
			email: manager?.email || "",
			name: manager?.name || "",
			phone: manager?.phone || "",
			status: manager?.status || "active",
			role: defaultRole,
			password: manager?.password || "",
		},
	})

	useEffect(() => {
		reset({
			email: manager?.email || "",
			name: manager?.name || "",
			phone: manager?.phone || "",
			status: manager?.status || "active",
			role: defaultRole,
			password: manager?.password || "",
		})
	}, [defaultRole, manager, reset])

	const submitHandler = async (data: ManagerFormValues) => {
		await onSubmit({
			...data,
			email: isEdit ? manager?.email || data.email : data.email,
		})
	}

	const handleGeneratePassword = () => {
		const chars =
			"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*?"
		let pwd = ""

		for (let i = 0; i < 12; i++) {
			pwd += chars[Math.floor(Math.random() * chars.length)]
		}

		setValue("password", pwd, { shouldDirty: true })
	}

	return (
		<form className={s.form} onSubmit={handleSubmit(submitHandler)}>
			<div className={s.section}>
				<Input
					label="Email"
					type="email"
					placeholder="manager@example.com"
					disabled={isEdit || isSubmitting}
					error={errors.email?.message}
					required
					{...register("email", { required: "Email обязателен" })}
				/>

				<Input
					label="Имя"
					type="text"
					placeholder="Имя менеджера"
					disabled={isSubmitting}
					error={errors.name?.message}
					{...register("name")}
				/>

				<Controller
					control={control}
					name="phone"
					render={({ field }) => (
						<Input
							label="Телефон"
							type="tel"
							placeholder="+7 900 000-00-00"
							disabled={isSubmitting}
							error={errors.phone?.message}
							inputMode="tel"
							{...field}
							onChange={event =>
								field.onChange(formatPhoneNumber(event.target.value))
							}
						/>
					)}
				/>

				<div className={s.passwordRow}>
					<Input
						label={
							isEdit ? "Новый пароль (опционально)" : "Пароль (опционально)"
						}
						type="text"
						placeholder="Если не заполнить — сгенерируем"
						disabled={isSubmitting}
						{...register("password")}
						className={s.passwordInput}
					/>

					<button
						type="button"
						className={s.generateButton}
						onClick={handleGeneratePassword}
						disabled={isSubmitting}
						aria-label="Сгенерировать пароль"
					>
						<Sparkles size={"1.8rem"} />
					</button>
				</div>
			</div>

			<div className={s.section}>
				<label className={s.selectLabel}>
					<span>Статус</span>

					<select
						{...register("status")}
						disabled={isSubmitting}
						className={s.select}
					>
						<option value="active">Активен</option>
						<option value="blocked">Заблокирован</option>
					</select>
				</label>

				<label className={s.selectLabel}>
					<span>Роль</span>

					<select
						{...register("role")}
						disabled={isSubmitting}
						className={s.select}
					>
						<option value="MANAGER">Менеджер</option>
						<option value="ADMIN">Администратор</option>
					</select>
				</label>
			</div>

			<div className={s.actions}>
				{onCancel && (
					<button
						type="button"
						className={s.secondary}
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Отмена
					</button>
				)}

				<button type="submit" className={s.primary} disabled={isSubmitting}>
					{isSubmitting ? "Сохраняем..." : isEdit ? "Сохранить" : "Добавить"}
				</button>
			</div>
		</form>
	)
}
