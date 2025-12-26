import { NextResponse } from "next/server"

import { mockGroupTransportBookings } from "@/lib/mock"

export const dynamic = "force-dynamic"

export async function GET() {
	return NextResponse.json({ items: mockGroupTransportBookings })
}
