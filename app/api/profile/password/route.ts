import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { new_password } = await request.json()
    if (!new_password || typeof new_password !== 'string' || new_password.length < 8) {
      return NextResponse.json({ error: 'invalid password' }, { status: 400 })
    }

    const { error } = await sb.auth.updateUser({ password: new_password })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
