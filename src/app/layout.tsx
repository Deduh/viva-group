import "@/styles/index.scss"
import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import Image from "next/image"
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
				<meta name="apple-mobile-web-app-title" content="VivaTour" />

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
						position: relative;
						aspect-ratio: 5.3/1;
						height: 15rem;
						width: fit-content;
					}
					#__preloader-logo img {
						object-fit: cover;
					}
					@media (max-width: 768px) {
						#__preloader-logo {
							height: 6rem;
						}
					}
				`,
					}}
				/>
			</head>

			<body className={`${inter.variable} ${oswald.variable}`}>
				<div id="__preloader" suppressHydrationWarning>
					<div id="__preloader-logo">
						<Image
							src="/viva-logo.webp"
							alt="Viva Tour"
							fill
							sizes="65rem"
							priority
						/>
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
