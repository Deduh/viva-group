import type { Booking, Message, Tour, User } from "@/types"
import { BookingStatus } from "@/types"
import type {
	GroupTransportBooking,
	GroupTransportSegment,
} from "@/types/group-transport"
import type { Role } from "./roles"

export const mockUsers: Array<User & { password: string }> = [
	{
		id: "u-client",
		email: "client@example.com",
		password: "password123",
		name: "Клиент",
		role: "CLIENT" as Role,
		status: "active",
	},
	{
		id: "u-manager",
		email: "manager@example.com",
		password: "password123",
		name: "Менеджер",
		role: "MANAGER" as Role,
		status: "active",
		phone: "+7 900 000-00-00",
		invitedAt: "2024-12-01T10:00:00Z",
		lastLoginAt: "2025-01-01T09:00:00Z",
	},
	{
		id: "u-admin",
		email: "admin@example.com",
		password: "password123",
		name: "Админ",
		role: "ADMIN" as Role,
		status: "active",
	},
]

export const mockTours: Tour[] = [
	{
		id: "t1",
		destination: "Санторини, Греция",
		shortDescription: "Белоснежные домики и закаты над кальдерой.",
		properties: ["7 дней и 6 ночей", "Бутик-отель", "Винные дегустации"],
		price: 2799,
		image: "/tours/tour-1.jpg",
		tags: ["Европа", "Море"],
		rating: 4.9,
	},
	{
		id: "t2",
		destination: "Сахара, Марокко",
		shortDescription: "Дюны, кемпинг в шатрах и берберские вечера.",
		properties: [
			"5 дней и 4 ночи",
			"Сафари на верблюдах",
			"Наблюдение за звёздами",
		],
		price: 1499,
		image: "/tours/tour-2.jpg",
		tags: ["Африка", "Сафари"],
		rating: 4.8,
	},
	{
		id: "t3",
		destination: "Мальдивы, Индийский океан",
		shortDescription: "Виллы над водой, персональный батлер и all inclusive.",
		properties: [
			"6 дней и 5 ночей",
			"Спа и дайвинг",
			"Трансфер на гидросамолёте",
		],
		price: 2199,
		image: "/tours/tour-3.jpg",
		tags: ["Море", "Премиум"],
		rating: 4.9,
	},
	{
		id: "t4",
		destination: "Киото, Япония",
		shortDescription: "Сакура, чайные церемонии и древние храмы.",
		properties: ["7 дней и 6 ночей", "Рёкан и онсэн", "Экскурсии по храмам"],
		price: 2500,
		image: "/tours/tour-4.jpg",
		tags: ["Азия", "Культура"],
		rating: 4.7,
	},
	{
		id: "t5",
		destination: "Альпы, Швейцария",
		shortDescription: "Катание в Церматте и уютные шале.",
		properties: ["6 дней и 5 ночей", "Ски-пасс и прокат", "СПА и ужины в шале"],
		price: 2200,
		image: "/tours/tour-5.jpg",
		tags: ["Горы", "Зима", "Европа"],
		rating: 4.6,
	},
	{
		id: "t6",
		destination: "Париж, Франция",
		shortDescription: "Романтика Сены, музеи и гастрономия.",
		properties: [
			"4 дня и 3 ночи",
			"Лувр и Эйфелева башня",
			"Ужин на кораблике",
		],
		price: 1890,
		image: "/tours/tour-6.jpg",
		tags: ["Европа", "Город"],
		rating: 4.8,
	},
	{
		id: "t7",
		destination: "Нью-Йорк, США",
		shortDescription: "Манхэттен, Бродвей и панорамы небоскрёбов.",
		properties: ["5 дней и 4 ночи", "Отель в центре", "Билеты на шоу"],
		price: 2100,
		image: "/tours/tour-7.jpg",
		tags: ["Америка", "Город"],
		rating: 4.5,
	},
	{
		id: "t8",
		destination: "Рим, Италия",
		shortDescription: "Колизей, Ватикан и лучшая паста.",
		properties: [
			"5 дней и 4 ночи",
			"Экскурсии по Колизею и Ватикану",
			"Дегустации вина",
		],
		price: 1750,
		image: "/tours/tour-8.jpg",
		tags: ["Европа", "Культура"],
		rating: 4.7,
	},
	{
		id: "t9",
		destination: "Бали, Индонезия",
		shortDescription: "Сёрфинг, рисовые террасы и восход на вулкан Батур.",
		properties: ["7 дней и 6 ночей", "Йога и серф-уроки", "Джунгли и водопады"],
		price: 1500,
		image: "/tours/tour-9.jpg",
		tags: ["Азия", "Море", "Активный"],
		rating: 4.8,
	},
	{
		id: "t10",
		destination: "Каппадокия, Турция",
		shortDescription: "Полёты на шарах и пещерные города.",
		properties: ["4 дня и 3 ночи", "Полёт на шаре", "Отель в скале"],
		price: 1300,
		image: "/tours/tour-10.jpg",
		tags: ["Азия", "Экзотика"],
		rating: 4.6,
	},
	{
		id: "t11",
		destination: "Дубай, ОАЭ",
		shortDescription: "Люкс-отели, сафари и небоскрёбы.",
		properties: [
			"5 дней и 4 ночи",
			"Сафари по пустыне",
			"Бурдж-Халифа и шопинг",
		],
		price: 2400,
		image: "/tours/tour-11.jpg",
		tags: ["Азия", "Премиум", "Город"],
		rating: 4.7,
	},
	{
		id: "t12",
		destination: "Рейкьявик, Исландия",
		shortDescription: "Голубая лагуна, водопады и северное сияние.",
		properties: [
			"6 дней и 5 ночей",
			"Джип-туры по водопадам",
			"Поездка за северным сиянием",
		],
		price: 2600,
		image: "/tours/tour-12.jpg",
		tags: ["Европа", "Природа"],
		rating: 4.9,
	},
]

export const mockBookings: Booking[] = [
	{
		id: "b1",
		userId: "u-client",
		tourId: "t1",
		status: BookingStatus.PENDING,
		partySize: 2,
		notes: "Хотим отдельный трансфер.",
		createdAt: "2025-01-05T10:00:00Z",
	},
	{
		id: "b2",
		userId: "u-client-2",
		tourId: "t2",
		status: BookingStatus.CONFIRMED,
		partySize: 4,
		notes: "Нужна виза для одного из участников.",
		createdAt: "2025-01-04T14:30:00Z",
	},
	{
		id: "b3",
		userId: "u-client",
		tourId: "t3",
		status: BookingStatus.IN_PROGRESS,
		partySize: 1,
		notes: "",
		createdAt: "2025-01-03T09:15:00Z",
	},
	{
		id: "b4",
		userId: "u-client-3",
		tourId: "t1",
		status: BookingStatus.COMPLETED,
		partySize: 3,
		notes: "Отличный тур!",
		createdAt: "2024-12-20T11:00:00Z",
	},
	{
		id: "b5",
		userId: "u-client-2",
		tourId: "t2",
		status: BookingStatus.CANCELLED,
		partySize: 2,
		notes: "Отмена по личным обстоятельствам.",
		createdAt: "2025-01-02T16:45:00Z",
	},
]

export const mockMessages: Message[] = [
	{
		id: "m1",
		bookingId: "b1",
		authorId: "u-manager",
		authorName: "Менеджер",
		text: "Добрый день! Уточните даты перелёта.",
		createdAt: "2025-01-06T09:00:00Z",
	},
	{
		id: "m2",
		bookingId: "b1",
		authorId: "u-client",
		authorName: "Клиент",
		text: "Прилетаем 10 февраля утром.",
		createdAt: "2025-01-06T09:10:00Z",
	},
]

const segment = (
	overrides: Partial<GroupTransportSegment> = {}
): GroupTransportSegment => ({
	direction: "forward",
	departureDate: "2025-02-10",
	flightNumber: "U6 1234",
	from: "Москва",
	to: "Сочи",
	passengers: {
		seniorsEco: 0,
		adultsEco: 10,
		youthEco: 5,
		childrenEco: 2,
		infantsEco: 0,
		seniorsBusiness: 0,
		adultsBusiness: 4,
		youthBusiness: 0,
		childrenBusiness: 0,
		infantsBusiness: 0,
	},
	...overrides,
})

export const mockGroupTransportBookings: GroupTransportBooking[] = [
	{
		id: "gtb-1",
		userId: "u-client",
		status: BookingStatus.CONFIRMED,
		createdAt: "2025-01-08T12:00:00Z",
		note: "Команда на выезд в Сочи",
		segments: [
			segment(),
			segment({
				direction: "return",
				departureDate: "2025-02-17",
				flightNumber: "U6 4321",
				from: "Сочи",
				to: "Москва",
			}),
		],
	},
	{
		id: "gtb-2",
		userId: "u-client",
		status: BookingStatus.PENDING,
		createdAt: "2025-01-12T09:30:00Z",
		note: "Школьный тур, ждём подтверждение опеки",
		segments: [
			segment({
				from: "Новосибирск",
				to: "Санкт-Петербург",
				departureDate: "2025-03-01",
				flightNumber: "U6 5566",
				passengers: {
					seniorsEco: 0,
					adultsEco: 4,
					youthEco: 20,
					childrenEco: 0,
					infantsEco: 0,
					seniorsBusiness: 0,
					adultsBusiness: 0,
					youthBusiness: 0,
					childrenBusiness: 0,
					infantsBusiness: 0,
				},
			}),
		],
	},
]

export function findMockUser(
	email: string,
	password: string
): Pick<User, "id" | "email" | "name" | "role"> | null {
	const user = mockUsers.find(u => u.email === email && u.password === password)

	if (!user) return null

	return { id: user.id, email: user.email, name: user.name, role: user.role }
}
