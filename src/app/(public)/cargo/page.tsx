import { PublicWrapper } from "@/components/layout/PublicLayout/PublicWrapper"
import {
	CargoAdvantages,
	CargoContacts,
	CargoFaq,
	CargoIntro,
	CargoProcess,
	CargoServices,
} from "@/components/pages/CargoPage"

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
		</div>
	)
}
