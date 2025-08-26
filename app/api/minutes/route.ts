import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getCurrentCycle, getMinutesBalance } from '@/lib/billing'

export async function GET(request: Request) {
  try {
  const sb = createRouteHandlerClient({ cookies })
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const userId = user.id

    const [cycle, remaining] = await Promise.all([
      getCurrentCycle(userId),
      getMinutesBalance(userId),
    ])

  return NextResponse.json({ remaining, cycle })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
