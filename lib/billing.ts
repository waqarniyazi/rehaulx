import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export type Plan = 'starter' | 'basic' | 'growth' | 'pro'

export const PLAN_MINUTES: Record<Plan, { monthly: number; yearly: number }> = {
  starter: { monthly: 100, yearly: 1200 },
  basic: { monthly: 300, yearly: 2400 },
  growth: { monthly: 800, yearly: 6400 },
  pro: { monthly: 1600, yearly: 12800 },
}

export async function getSupabase() {
  return createRouteHandlerClient({ cookies })
}

export function ceilMinutes(seconds: number) {
  return Math.max(1, Math.ceil(seconds / 60))
}

export async function getCurrentCycle(userId: string) {
  const sb = await getSupabase()
  const { data } = await sb
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data || null
}

export async function getMinutesBalance(userId: string) {
  const sb = await getSupabase()
  const now = new Date().toISOString()
  // Sum credits and debits within current active cycle OR entries with no cycle (global)
  const { data: credits } = await sb
    .from('minutes_ledger')
    .select('minutes')
    .eq('user_id', userId)
    .eq('entry_type', 'credit')
    .or(`and(cycle_start.lte.${now},cycle_end.gte.${now}),and(cycle_start.is.null,cycle_end.is.null)`)

  const { data: debits } = await sb
    .from('minutes_ledger')
    .select('minutes')
    .eq('user_id', userId)
    .eq('entry_type', 'debit')
    .or(`and(cycle_start.lte.${now},cycle_end.gte.${now}),and(cycle_start.is.null,cycle_end.is.null)`)

  const creditSum = (credits || []).reduce((a, b: any) => a + (b.minutes || 0), 0)
  const debitSum = (debits || []).reduce((a, b: any) => a + (b.minutes || 0), 0)
  return creditSum - debitSum
}

export async function creditMinutes(userId: string, minutes: number, reason: string, cycle?: { start: string; end: string }, currency = 'USD', meta: any = {}) {
  const sb = await getSupabase()
  await sb.from('minutes_ledger').insert({
    user_id: userId,
    minutes,
    entry_type: 'credit',
    reason,
    currency,
    cycle_start: cycle?.start,
    cycle_end: cycle?.end,
    meta,
  })
}

export async function debitMinutes(userId: string, minutes: number, reason: string, cycle?: { start: string; end: string }, meta: any = {}) {
  const sb = await getSupabase()
  await sb.from('minutes_ledger').insert({
    user_id: userId,
    minutes,
    entry_type: 'debit',
    reason,
    cycle_start: cycle?.start,
    cycle_end: cycle?.end,
    meta,
  })
}
