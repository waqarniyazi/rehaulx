import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, getUserMinutesBalance, shouldShowUpgradeNudge } from '@/lib/billing'

export async function GET(request: Request) {
  try {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const userId = user.id

    const [subscription, usage, upgradeNudge] = await Promise.all([
      getUserSubscription(userId),
      getUserMinutesBalance(userId),
      shouldShowUpgradeNudge(userId),
    ])

    return NextResponse.json({ 
      remaining: usage.remaining,
      allocated: usage.allocated,
      used: usage.used,
      cycle_end: usage.cycle_end,
      subscription,
      upgrade_nudge: upgradeNudge
    })
  } catch (e: any) {
    console.error('Error in /api/minutes:', e)
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
