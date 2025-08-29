import { NextResponse } from 'next/server'
import { getAvailablePlans, PLAN_MINUTES, PLAN_PRICES } from '@/lib/billing'

export async function GET() {
  try {
    const plans = await getAvailablePlans()
    const mapped = plans.map((p) => {
      const name = p.name as keyof typeof PLAN_PRICES
      const prices = PLAN_PRICES[name]
      const minutes = PLAN_MINUTES[name]
      return prices && minutes
        ? {
            ...p,
            price_monthly: prices.monthly,
            price_yearly: prices.yearly,
            minutes_monthly: minutes.monthly,
            minutes_yearly: minutes.yearly,
          }
        : p
    })
    return NextResponse.json({ plans: mapped })
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
