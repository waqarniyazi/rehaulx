import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await request.json()
    const { first_name, last_name, full_name, avatar_url } = body

    const { error } = await sb.auth.updateUser({
      data: {
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        full_name: full_name || undefined,
        avatar_url: avatar_url || undefined,
      }
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
