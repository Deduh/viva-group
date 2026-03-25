import "@/styles/index.scss"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Image from "next/image"
import { Providers } from "./providers"

export const metadata: Metadata = {
	title: "Viva Group",
	description:
		"Премиальные туры и групповые перевозки. Подбор маршрутов, перелетов и авторских программ.",
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const nonce = (await headers()).get("x-nonce") ?? undefined

	return (
		<html lang="ru">
			<head>
				<meta name="apple-mobile-web-app-title" content="VivaTour" />

				<style
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `
					:root {
						--font-inter: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
						--font-oswald: "Arial Narrow", "Helvetica Neue Condensed", "Franklin Gothic Medium", sans-serif;
					}
					#__preloader {
						position: fixed;
						inset: 0;
						width: 100%;
						height: 100vh;
						height: 100dvh;
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

			<body>
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
					nonce={nonce}
					suppressHydrationWarning
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
