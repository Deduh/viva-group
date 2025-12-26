import { NextResponse } from "next/server"

import { mockTours } from "@/lib/mock"

export const dynamic = "force-dynamic"

export async function GET() {
	return NextResponse.json({ items: mockTours })
}
