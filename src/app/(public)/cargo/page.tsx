import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import {
	CargoAdvantages,
	CargoContacts,
	CargoFaq,
	CargoIntro,
	CargoProcess,
	CargoServices,
} from "@/components/pages/CargoPage"
import { CargoWidget } from "@/components/pages/CargoPage/CargoWidget/CargoWidget"

export default function CargoPage() {
	return (
		<div>
			<CargoIntro />

			<PublicWrapper>
				<CargoServices />

				<CargoProcess />

				<CargoAdvantages />

				<CargoFaq />

				<CargoContacts />
			</PublicWrapper>

			<CargoWidget />
		</div>
	)
}
