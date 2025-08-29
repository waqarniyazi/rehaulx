import { NextResponse } from 'next/server'
import { creditUserMinutes } from '@/lib/billing'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Try to insert free signup credit; rely on unique index to avoid duplicates
  await creditUserMinutes(user.id, 10, 'free_signup')
    return NextResponse.json({ ok: true, credited: 10 })
  } catch (e: any) {
    // If already exists, treat as ok
    return NextResponse.json({ ok: true, credited: 0 })
  }
}
