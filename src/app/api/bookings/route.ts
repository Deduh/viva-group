import { NextResponse } from "next/server"

import { mockBookings } from "@/lib/mock"

export const dynamic = "force-dynamic"

export async function GET() {
	return NextResponse.json({ items: mockBookings })
}
