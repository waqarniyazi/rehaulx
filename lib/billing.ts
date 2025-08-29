import { createClient } from '@/lib/supabase/server'

export type Plan = 'starter' | 'basic' | 'growth' | 'pro'
export type BillingCycle = 'monthly' | 'yearly'

export interface PlanDetails {
  id: number
  name: string
  display_name: string
  price_monthly: number
  price_yearly: number
  minutes_monthly: number
  minutes_yearly: number
  perks: string[]
  is_active: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: number
  billing_cycle: BillingCycle
  status: 'active' | 'cancelled' | 'paused' | 'expired'
  current_period_start: string
  current_period_end: string
  razorpay_subscription_id?: string
  plan?: PlanDetails
}

export interface UserUsage {
  allocated: number
  used: number
  remaining: number
  cycle_end: string | null
}

export interface UsageLogEntry {
  id: string
  user_id: string
  video_id?: string
  video_title?: string
  video_duration?: number
  minutes_used: number
  processing_type: string
  created_at: string
}

export const PLAN_PRICES = {
  starter: { monthly: 8, yearly: 80 },
  basic: { monthly: 18, yearly: 160 },
  growth: { monthly: 35, yearly: 280 },
  pro: { monthly: 60, yearly: 480 },
}

export const PLAN_MINUTES = {
  starter: { monthly: 100, yearly: 1200 },
  basic: { monthly: 300, yearly: 2400 },
  growth: { monthly: 800, yearly: 6400 },
  pro: { monthly: 1600, yearly: 12800 },
}

export const ADDON_PRICES = {
  small: { price: 5, minutes: 50 },
  medium: { price: 10, minutes: 100 },
}

export async function getSupabase() {
  return createClient()
}

export function ceilMinutes(seconds: number) {
  return Math.max(1, Math.ceil(seconds / 60))
}

// Get all available plans
export async function getAvailablePlans(): Promise<PlanDetails[]> {
  const sb = await getSupabase()
  const { data, error } = await sb
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true })
    
  if (error) throw error
  return data || []
}

// Get user's current subscription
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const sb = await getSupabase()
  const { data, error } = await sb
    .from('subscriptions')
    .select(`
      *,
      plans (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()
    
  if (error) throw error
  return data ? { ...data, plan: data.plans } : null
}

// Get user's current minutes balance
export async function getUserMinutesBalance(userId: string): Promise<UserUsage> {
  const sb = await getSupabase()
  
  const { data, error } = await sb.rpc('get_user_minutes_balance', {
    p_user_id: userId
  })
  
  if (error) throw error
  
  if (!data || data.length === 0) {
    return { allocated: 0, used: 0, remaining: 0, cycle_end: null }
  }
  
  return {
    allocated: data[0].allocated || 0,
    used: data[0].used || 0,
    remaining: data[0].remaining || 0,
    cycle_end: data[0].cycle_end
  }
}

// Deduct minutes from user's balance
export async function deductUserMinutes(
  userId: string,
  minutes: number,
  videoId?: string,
  videoTitle?: string,
  videoDuration?: number,
  processingType: string = 'transcript'
): Promise<boolean> {
  const sb = await getSupabase()
  
  const { data, error } = await sb.rpc('deduct_user_minutes', {
    p_user_id: userId,
    p_minutes: minutes,
    p_video_id: videoId,
    p_video_title: videoTitle,
    p_video_duration: videoDuration,
    p_processing_type: processingType
  })
  
  if (error) throw error
  return data === true
}

// Credit minutes to user's balance
export async function creditUserMinutes(
  userId: string,
  minutes: number,
  reason: string = 'manual_credit',
  cycleStart?: string,
  cycleEnd?: string
): Promise<void> {
  const sb = await getSupabase()
  
  const { error } = await sb
    .from('user_usage')
    .insert({
      user_id: userId,
      allocated_minutes: minutes,
      used_minutes: 0,
      remaining_minutes: minutes,
      cycle_start: cycleStart || null,
      cycle_end: cycleEnd || null
    })
  
  if (error) throw error
}

// Get user's usage history
export async function getUserUsageHistory(
  userId: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<UsageLogEntry[]> {
  const sb = await getSupabase()
  
  const { data, error } = await sb
    .from('usage_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data || []
}

// Create a new subscription
export async function createSubscription(
  userId: string,
  planId: number,
  billingCycle: BillingCycle,
  razorpaySubscriptionId?: string
): Promise<UserSubscription> {
  const sb = await getSupabase()
  
  // Calculate period dates
  const now = new Date()
  const periodEnd = new Date(now)
  if (billingCycle === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }
  
  const { data, error } = await sb
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      razorpay_subscription_id: razorpaySubscriptionId,
      status: 'active'
    })
    .select(`
      *,
      plans (*)
    `)
    .single()
  
  if (error) throw error
  
  // Credit the plan's minutes to the user
  const plan = await getPlanById(planId)
  if (plan) {
    const minutes = billingCycle === 'monthly' ? plan.minutes_monthly : plan.minutes_yearly
    await creditUserMinutes(
      userId, 
      minutes, 
      `${plan.display_name} - ${billingCycle}`,
      now.toISOString(),
      periodEnd.toISOString()
    )
  }
  
  return { ...data, plan: data.plans }
}

// Get plan by ID
export async function getPlanById(planId: number): Promise<PlanDetails | null> {
  const sb = await getSupabase()
  
  const { data, error } = await sb
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single()
  
  if (error) return null
  return data
}

// Get plan by name
export async function getPlanByName(planName: string): Promise<PlanDetails | null> {
  const sb = await getSupabase()
  
  const { data, error } = await sb
    .from('plans')
    .select('*')
    .eq('name', planName)
    .single()
  
  if (error) return null
  return data
}

// Record a purchase (add-on minutes)
export async function recordPurchase(
  userId: string,
  purchaseType: 'addon_minutes' | 'plan_upgrade',
  minutesPurchased: number | null,
  amountPaid: number,
  currency: string = 'USD',
  razorpayPaymentId?: string
): Promise<void> {
  const sb = await getSupabase()
  
  const { error } = await sb
    .from('purchases')
    .insert({
      user_id: userId,
      purchase_type: purchaseType,
      minutes_purchased: minutesPurchased,
      amount_paid: amountPaid,
      currency,
      razorpay_payment_id: razorpayPaymentId,
      status: 'completed'
    })
  
  if (error) throw error
  
  // If it's addon minutes, credit them to the user
  if (purchaseType === 'addon_minutes' && minutesPurchased) {
    await creditUserMinutes(userId, minutesPurchased, 'addon_purchase')
  }
}

// Check if user should see upgrade nudge
export async function shouldShowUpgradeNudge(userId: string): Promise<{
  show: boolean
  reason: string
  recommendedPlan?: string
}> {
  const usage = await getUserMinutesBalance(userId)
  const subscription = await getUserSubscription(userId)
  
  // If user has no subscription, show upgrade after using 80% of free minutes
  if (!subscription && usage.allocated > 0) {
    const usagePercent = (usage.used / usage.allocated) * 100
    if (usagePercent >= 80) {
      return {
        show: true,
        reason: 'free_minutes_depleted',
        recommendedPlan: 'starter'
      }
    }
  }
  
  // If user has subscription, show upgrade when 80% used
  if (subscription && usage.allocated > 0) {
    const usagePercent = (usage.used / usage.allocated) * 100
    if (usagePercent >= 80) {
      const nextPlan = getNextPlanUp(subscription.plan?.name)
      return {
        show: true,
        reason: 'subscription_limit_reached',
        recommendedPlan: nextPlan
      }
    }
  }
  
  return { show: false, reason: 'sufficient_minutes' }
}

function getNextPlanUp(currentPlan?: string): string {
  switch (currentPlan) {
    case 'starter': return 'basic'
    case 'basic': return 'growth'
    case 'growth': return 'pro'
    default: return 'starter'
  }
}
