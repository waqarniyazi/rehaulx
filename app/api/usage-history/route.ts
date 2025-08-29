import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserUsageHistory } from '@/lib/billing'

export async function GET(request: Request) {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const history = await getUserUsageHistory(user.id, limit, offset)
    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('Error fetching usage history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
