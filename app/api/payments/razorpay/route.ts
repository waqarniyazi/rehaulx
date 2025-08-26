import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  // Stub: in a real impl, call Razorpay Orders/Subscriptions API here
  return NextResponse.json({ ok: true, echo: body })
}
