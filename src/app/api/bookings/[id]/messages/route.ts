import { NextResponse } from "next/server"

import { mockMessages } from "@/lib/mock"

export const dynamic = "force-dynamic"

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: RouteContext) {
	const { id } = await params
	const items = mockMessages.filter((msg) => msg.bookingId === id)
	return NextResponse.json({ items })
}
