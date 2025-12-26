import "@/styles/index.scss"
import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import { Providers } from "./providers"

export const metadata: Metadata = {
	title: "Viva Group",
	description:
		"Премиальные туры и групповые перевозки. Подбор маршрутов, перелетов и авторских программ.",
}

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
})

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
	display: "swap",
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ru">
			<head>
				<style
					dangerouslySetInnerHTML={{
						__html: `
					#__preloader {
						position: fixed;
						top: 0;
						left: 0;
						width: 100%;
						height: 100vh;
						z-index: 9999;
						display: flex;
						align-items: center;
						justify-content: center;
						background-color: #ffffff;
						pointer-events: all;
					}
					#__preloader-logo {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						gap: 1.6rem;
						padding: 3rem 5rem;
						border-radius: 3rem;
						background: rgba(224, 242, 254, 0.3);
						backdrop-filter: blur(2rem);
						-webkit-backdrop-filter: blur(2rem);
						border: 1px solid rgba(255, 255, 255, 0.6);
						border-top: 1px solid rgba(255, 255, 255, 0.9);
						border-bottom: 1px solid rgba(186, 230, 253, 0.4);
						box-shadow: 0 2rem 4rem -1rem rgba(14, 165, 233, 0.15), 0 0 2rem 0 rgba(186, 230, 253, 0.4) inset;
						opacity: 0;
						transform: scale(0.95) translateY(2rem);
					}
				`,
					}}
				/>
			</head>

			<body className={`${inter.variable} ${oswald.variable}`}>
				<div id="__preloader" suppressHydrationWarning>
					<div id="__preloader-logo">
						<svg
							width="56"
							height="56"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							style={{
								filter: "drop-shadow(0 0 1.2rem rgba(56, 189, 248, 0.6))",
								color: "#0ea5e9",
							}}
						>
							<defs>
								<clipPath id="markerClip">
									<path
										fill="#fff"
										d="M15.143 22.727c-3.992-5.743-4.703-6.344-4.703-8.477A5.234 5.234 0 0 1 15.69 9a5.251 5.251 0 0 1 5.25 5.25c0 2.133-.738 2.734-4.73 8.477a.639.639 0 0 1-1.067 0Zm.547-6.29a2.176 2.176 0 0 0 2.187-2.187 2.194 2.194 0 0 0-2.187-2.188c-1.23 0-2.188.985-2.188 2.188a2.16 2.16 0 0 0 2.188 2.188Z"
									/>
								</clipPath>
							</defs>
							<g>
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
						<span
							style={{
								fontFamily: "var(--font-oswald)",
								fontSize: "2.6rem",
								fontWeight: 600,
								letterSpacing: "0.25em",
								textTransform: "uppercase",
								background:
									"linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(125, 211, 252, 1) 50%, rgba(14, 165, 233, 1) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
								filter: "drop-shadow(0 0.2rem 0.4rem rgba(14, 165, 233, 0.2))",
							}}
						>
							VIVA GROUP
						</span>
					</div>
				</div>

				<script
					dangerouslySetInnerHTML={{
						__html: `
					(function() {
						try {
							if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('preloader-shown') === 'true') {
								var preloader = document.getElementById('__preloader');
								if (preloader) {
									preloader.style.display = 'none';
								}
							}
						} catch(e) {}
					})();
				`,
					}}
				/>

				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
