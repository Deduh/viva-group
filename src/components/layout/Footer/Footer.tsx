import { TransitionLink } from "@/components/ui/PageTransition"
import Image from "next/image"
import Link from "next/link"
import s from "./Footer.module.scss"

export function Footer() {
	return (
		<footer className={s.footer}>
			<div className={s.footerTop}>
				<div className={s.footerTopWrapper}>
					<div className={s.content}>
						<TransitionLink className={s.logo} href="/">
							<Image
								className={s.logoImage}
								src="/viva-logo.webp"
								alt="Viva Tour Logo"
								fill
							/>
						</TransitionLink>

						<p className={s.contentText}>
							Исследуйте скрытые сокровища планеты вместе с нами: авторские
							маршруты, закрытые отели, VIP-сервис.
						</p>
					</div>

					<div className={s.contentWrapper}>
						<div className={s.content}>
							<h5 className={s.contentTitle}>Навигация</h5>

							<div className={s.links}>
								<TransitionLink href="/" className={s.link}>
									Главная
								</TransitionLink>

								<TransitionLink href="/tours" className={s.link}>
									Туры
								</TransitionLink>

								<TransitionLink href="/group" className={s.link}>
									Групповые перевозки
								</TransitionLink>

								<TransitionLink href="/contacts" className={s.link}>
									Контакты
								</TransitionLink>

								<TransitionLink href="/login" className={s.link}>
									Личный кабинет
								</TransitionLink>
							</div>
						</div>

						<div className={s.content}>
							<h5 className={s.contentTitle}>Поддержка</h5>

							<div className={s.links}>
								<Link
									href="/docs/agency-contract-viva-group.docx"
									className={s.link}
									download
								>
									Агентский договор
								</Link>

								<Link
									href="https://t.me/SKusatov"
									className={s.link}
									target="_blank"
									rel="noreferrer"
								>
									Telegram
								</Link>

								<Link
									href="https://wa.me/77775658706"
									className={s.link}
									target="_blank"
									rel="noreferrer"
								>
									WhatsApp
								</Link>

								<Link href="mailto:vivatoursochi@gmail.com" className={s.link}>
									vivatoursochi@gmail.com
								</Link>

								<TransitionLink href="/terms-of-service" className={s.link}>
									Условия использования
								</TransitionLink>

								<TransitionLink href="/privacy-policy" className={s.link}>
									Политика конфиденциальности
								</TransitionLink>
							</div>
						</div>
					</div>
				</div>

				<div className={s.company}>
					<span className={s.companyText}>
						© {new Date().getFullYear()} VIVA GROUP. Все права защищены.
					</span>
				</div>
			</div>

			<div className={s.footerBottom}>
				<div className={s.footerBottomText}>VIVA GROUP</div>
			</div>
		</footer>
	)
}
