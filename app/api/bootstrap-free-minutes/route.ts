import { NextResponse } from 'next/server'
import { creditMinutes } from '@/lib/billing'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST() {
  try {
    const sb = createRouteHandlerClient({ cookies })
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Try to insert free signup credit; rely on unique index to avoid duplicates
    await creditMinutes(user.id, 10, 'free_signup')
    return NextResponse.json({ ok: true, credited: 10 })
  } catch (e: any) {
    // If already exists, treat as ok
    return NextResponse.json({ ok: true, credited: 0 })
  }
}
