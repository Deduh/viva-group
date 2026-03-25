import { env } from "./env/client"

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void
			execute: (
				siteKey: string,
				options: {
					action: string
				},
			) => Promise<string>
		}
		__vivaRecaptchaLoadPromise?: Promise<void>
	}
}

export const RECAPTCHA_ACTIONS = {
	LOGIN: "login_submit",
	REGISTER: "register_submit",
	CONTACT: "contact_submit",
	MAILING: "mailing_subscribe",
	AGENT_APPLICATION: "agent_application_submit",
	TOUR_BOOKING: "tour_booking_create",
	CHARTER_BOOKING: "charter_booking_create",
	GROUP_TRANSPORT_BOOKING: "group_transport_booking_create",
} as const

export type RecaptchaAction =
	(typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS]

const scriptId = "viva-group-recaptcha-v3"
const siteKey = env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim()

const ensureRecaptchaScript = async () => {
	if (typeof window === "undefined") return

	if (!siteKey) {
		throw new Error("reCAPTCHA не настроена. Проверьте NEXT_PUBLIC_RECAPTCHA_SITE_KEY.")
	}

	if (window.grecaptcha) {
		await new Promise<void>(resolve => window.grecaptcha?.ready(() => resolve()))
		return
	}

	if (!window.__vivaRecaptchaLoadPromise) {
		window.__vivaRecaptchaLoadPromise = new Promise<void>((resolve, reject) => {
			const existingScript = document.getElementById(scriptId)

			if (existingScript) {
				existingScript.addEventListener("load", () => resolve(), { once: true })
				existingScript.addEventListener(
					"error",
					() => reject(new Error("Не удалось загрузить reCAPTCHA")),
					{ once: true },
				)
				return
			}

			const script = document.createElement("script")
			script.id = scriptId
			script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
			script.async = true
			script.defer = true
			script.onload = () => resolve()
			script.onerror = () =>
				reject(new Error("Не удалось загрузить reCAPTCHA"))
			document.head.appendChild(script)
		})
	}

	await window.__vivaRecaptchaLoadPromise

	if (!window.grecaptcha) {
		throw new Error("reCAPTCHA не инициализирована")
	}

	await new Promise<void>(resolve => window.grecaptcha?.ready(() => resolve()))
}

export async function executeRecaptcha(action: RecaptchaAction) {
	if (typeof window === "undefined") return null

	if (!siteKey) {
		throw new Error("reCAPTCHA не настроена. Проверьте client env.")
	}

	await ensureRecaptchaScript()

	if (!window.grecaptcha) {
		throw new Error("reCAPTCHA недоступна. Попробуйте обновить страницу.")
	}

	const token = await window.grecaptcha.execute(siteKey, { action })

	if (!token) {
		throw new Error("Не удалось получить токен reCAPTCHA.")
	}

	return token
}

export async function getRecaptchaHeaders(
	action: RecaptchaAction,
	providedToken?: string | null,
) {
	const token =
		typeof providedToken === "string" && providedToken.trim().length > 0
			? providedToken.trim()
			: await executeRecaptcha(action)

	if (!token) {
		return {}
	}

	return {
		"X-Recaptcha-Token": token,
		"X-Recaptcha-Action": action,
	}
}
