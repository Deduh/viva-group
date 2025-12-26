"use client"

import toast from "react-hot-toast"

type ToastOptions = {
	duration?: number
	position?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right"
}

export function useToast() {
	const baseStyle = {
		background: "rgba(255, 255, 255, 0.78)",
		backdropFilter: "blur(2.4rem) saturate(180%)",
		WebkitBackdropFilter: "blur(2.4rem) saturate(180%)",
		border: "0.1rem solid rgba(255, 255, 255, 0.65)",
		boxShadow:
			"0 1.2rem 3.2rem rgba(15, 23, 42, 0.12), 0 0 0 0.1rem rgba(255, 255, 255, 0.7) inset",
		borderRadius: "2rem",
		padding: "1.6rem 1.8rem",
		fontSize: "1.4rem",
		fontWeight: 600,
		color: "#0f172a",
	}

	const withAccent = (accent: string) => ({
		...baseStyle,
		border: `0.1rem solid ${accent}`,
		boxShadow: `0 1.2rem 3.2rem ${accent}, 0 0 0 0.1rem rgba(255, 255, 255, 0.7) inset`,
	})

	const showSuccess = (message: string, options?: ToastOptions) => {
		toast.success(message, {
			duration: options?.duration || 3000,
			position: options?.position || "top-right",
			style: withAccent("rgba(34, 197, 94, 0.4)"),
			iconTheme: {
				primary: "#22c55e",
				secondary: "#ffffff",
			},
		})
	}

	const showError = (message: string, options?: ToastOptions) => {
		toast.error(message, {
			duration: options?.duration || 4000,
			position: options?.position || "top-right",
			style: withAccent("rgba(239, 68, 68, 0.45)"),
			iconTheme: {
				primary: "#ef4444",
				secondary: "#ffffff",
			},
		})
	}

	const showInfo = (message: string, options?: ToastOptions) => {
		toast(message, {
			duration: options?.duration || 3000,
			position: options?.position || "top-right",
			icon: "ℹ️",
			style: withAccent("rgba(59, 130, 246, 0.35)"),
		})
	}

	const showLoading = (message: string) => {
		return toast.loading(message, {
			position: "top-right",
			style: withAccent("rgba(15, 23, 42, 0.12)"),
		})
	}

	const dismiss = (toastId?: string) => {
		if (toastId) {
			toast.dismiss(toastId)
		} else {
			toast.dismiss()
		}
	}

	const promise = <T>(
		promise: Promise<T>,
		messages: {
			loading: string
			success: string
			error: string
		}
	) => {
		return toast.promise(
			promise,
			{
				loading: messages.loading,
				success: messages.success,
				error: messages.error,
			},
			{
				style: baseStyle,
				success: {
					style: withAccent("rgba(34, 197, 94, 0.4)"),
				},
				error: {
					style: withAccent("rgba(239, 68, 68, 0.45)"),
				},
				loading: {
					style: withAccent("rgba(15, 23, 42, 0.12)"),
				},
			}
		)
	}

	return {
		showSuccess,
		showError,
		showInfo,
		showLoading,
		dismiss,
		promise,
	}
}
