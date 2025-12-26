import type { SVGProps } from "react"

export function MarkerIcon2(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1.8306rem"
			height="2.4023rem"
			role="img"
			aria-hidden={props["aria-label"] ? undefined : true}
			fill="none"
			{...props}
		>
			<path
				fill="#60A5FA"
				d="M8.063 23.531C1.218 13.688 0 12.656 0 9c0-4.969 3.984-9 9-9 4.969 0 9 4.031 9 9 0 3.656-1.266 4.688-8.11 14.531-.421.657-1.406.657-1.828 0ZM9 12.75c2.063 0 3.75-1.64 3.75-3.75A3.761 3.761 0 0 0 9 5.25 3.731 3.731 0 0 0 5.25 9c0 2.11 1.64 3.75 3.75 3.75Z"
			/>
		</svg>
	)
}
