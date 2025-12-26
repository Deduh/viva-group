import { NextResponse } from "next/server"

export async function POST(req: Request) {
	try {
		const formData = await req.formData()
		const file = formData.get("file")

		if (!file || !(file instanceof File)) {
			return NextResponse.json(
				{ message: "Файл не найден в запросе" },
				{ status: 400 }
			)
		}

		// Моковый URL сохранения. В реальном бэке сохраняем в хранилище и возвращаем публичный URL.
		const safeName = file.name.replace(/\s+/g, "-")
		const url = `/uploads/tours/${Date.now()}-${safeName}`

		return NextResponse.json({ url })
	} catch (error) {
		return NextResponse.json(
			{
				message:
					error instanceof Error
						? error.message
						: "Ошибка при загрузке файла",
			},
			{ status: 500 }
		)
	}
}
