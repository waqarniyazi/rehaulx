import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data, error } = await sb.rpc('grant_monthly_free_minutes_if_needed', { p_user_id: user.id })
    if (error) throw error

    return NextResponse.json({ ok: true, granted: Boolean(data) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
