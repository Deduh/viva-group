import { NextResponse } from "next/server"

import { mockTours } from "@/lib/mock"

export const dynamic = "force-dynamic"

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: RouteContext) {
	const { id } = await params
	const tour = mockTours.find((item) => item.id === id)
	if (!tour) {
		return NextResponse.json({ message: "Not found" }, { status: 404 })
	}
	return NextResponse.json(tour)
}
