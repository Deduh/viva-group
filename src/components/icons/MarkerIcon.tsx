import type { SVGProps } from "react"

export function MarkerIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			role="img"
			aria-hidden={props["aria-label"] ? undefined : true}
			{...props}
		>
			<defs>
				<clipPath id="markerClip">
					<path
						fill="#fff"
						d="M15.143 22.727c-3.992-5.743-4.703-6.344-4.703-8.477A5.234 5.234 0 0 1 15.69 9a5.251 5.251 0 0 1 5.25 5.25c0 2.133-.738 2.734-4.73 8.477a.639.639 0 0 1-1.067 0Zm.547-6.29a2.176 2.176 0 0 0 2.187-2.187 2.194 2.194 0 0 0-2.187-2.188c-1.23 0-2.188.985-2.188 2.188a2.16 2.16 0 0 0 2.188 2.188Z"
					/>
				</clipPath>
				<filter
					id="markerBlur"
					x="0"
					y="0"
					width="32"
					height="32"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
				</filter>
			</defs>

			<g filter="url(#markerBlur)">
				<rect
					width="32"
					height="32"
					rx="16"
					fill="currentColor"
					fillOpacity="0.2"
				/>
				<rect
					width="31"
					height="31"
					x=".5"
					y=".5"
					rx="15.5"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.5"
				/>
				<path
					fill="currentColor"
					d="M15.143 22.727c-3.992-5.743-4.703-6.344-4.703-8.477A5.234 5.234 0 0 1 15.69 9a5.251 5.251 0 0 1 5.25 5.25c0 2.133-.738 2.734-4.73 8.477a.639.639 0 0 1-1.067 0Zm.547-6.29a2.176 2.176 0 0 0 2.187-2.187 2.194 2.194 0 0 0-2.187-2.188c-1.23 0-2.188.985-2.188 2.188a2.16 2.16 0 0 0 2.188 2.188Z"
				/>
			</g>
		</svg>
	)
}
