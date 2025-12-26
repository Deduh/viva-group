import { Calendar, ChevronDown, MapPin, Search } from "lucide-react"

import s from "./SearchBar.module.scss"

export function SearchBar() {
	return (
		<div className={s.bar}>
			<div className={s.wrapper}>
				<div className={s.field}>
					<div className={s.icon}>
						<MapPin size={"2rem"} />
					</div>

					<div className={s.fieldText}>
						<div className={s.label}>
							<div className={s.labelText}>Куда?</div>

							<ChevronDown size={"1.6rem"} color="rgba(156, 163, 175, 1)" />
						</div>

						<div className={s.placeholder}>Напишите направление</div>
					</div>
				</div>

				<div className={s.field}>
					<div className={`${s.icon} ${s.purple}`}>
						<Calendar size={"2rem"} />
					</div>

					<div className={s.fieldText}>
						<div className={s.label}>
							<div className={s.labelText}>Дата</div>

							<ChevronDown size={"1.6rem"} color="rgba(156, 163, 175, 1)" />
						</div>

						<div className={s.placeholder}>Выберите дату</div>
					</div>
				</div>
			</div>

			<button className={s.button} type="button">
				<div className={s.buttonText}>Найти билеты</div>

				<div className={s.buttonIcon}>
					<Search size={"1.6rem"} />
				</div>
			</button>
		</div>
	)
}
