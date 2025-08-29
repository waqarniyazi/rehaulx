import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import { getPlanById } from '@/lib/billing'

type CheckoutBody = {
  type: 'addon' | 'subscription'
  plan_id?: string
  billing_cycle?: 'monthly' | 'yearly'
  addon_minutes?: number
  currency?: 'INR' | 'USD'
}

// Fixed add-on bundle amounts (minor units)
const ADDON_BUNDLES_USD: Record<number, number> = {
  50: 500,   // $5.00
  100: 1000, // $10.00
}

export async function POST(request: Request) {
  try {
  const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { type, plan_id, billing_cycle, addon_minutes = 0, currency = 'USD' } = await request.json() as CheckoutBody

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay not configured (missing key id or secret)' }, { status: 500 })
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

  if (type === 'addon') {
      if (!addon_minutes || addon_minutes <= 0) {
        return NextResponse.json({ error: 'addon_minutes required' }, { status: 400 })
      }
      // Currently only USD fixed bundles per requirements
      if (currency !== 'USD') {
        return NextResponse.json({ error: 'Only USD supported for add-ons at the moment' }, { status: 400 })
      }
      const amountMinor = ADDON_BUNDLES_USD[addon_minutes]
      if (!amountMinor) {
        return NextResponse.json({ error: 'Unsupported add-on bundle' }, { status: 400 })
      }

      let order
      try {
        const shortReceipt = `ad_${Date.now().toString().slice(-10)}` // <= 40 chars
        order = await rzp.orders.create({
          amount: amountMinor,
          currency,
          receipt: shortReceipt,
          notes: {
            user_id: user.id,
            kind: 'addon',
            addon_minutes: String(addon_minutes),
          },
        })
      } catch (err: any) {
        const msg = err?.error?.description || err?.message || 'Razorpay order creation failed'
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      // Record a pending payment intent
      await sb.from('payments').insert({
        user_id: user.id,
        amount: amountMinor / 100,
        currency,
        status: 'pending',
        payment_method: 'razorpay',
        // we also record a shadow row in a metadata table if needed; for now, order id tracked via purchases receipt in Razorpay
      })

  return NextResponse.json({ ok: true, provider: 'razorpay', order, key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID })
    }

  if (type === 'subscription') {
      if (!plan_id || !billing_cycle) {
        return NextResponse.json({ error: 'plan_id and billing_cycle are required' }, { status: 400 })
      }

      const plan = await getPlanById(Number(plan_id))
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

      const priceUsd = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly
      // Razorpay commonly requires INR unless multi-currency is enabled; use INR by default
      const fx: Record<string, number> = { USD: 1, INR: 83.5 }
      const cur: 'INR' = 'INR'
      const amountMinor = Math.max(100, Math.round(priceUsd * fx[cur] * 100)) // ≥ ₹1.00

      let order
      try {
        const shortReceipt = `su_${plan.id}_${Date.now().toString().slice(-8)}` // <= 40 chars
        order = await rzp.orders.create({
          amount: amountMinor,
          currency: cur,
          receipt: shortReceipt,
          notes: {
            user_id: user.id,
            kind: 'subscription',
            plan_id: String(plan.id),
            billing_cycle,
          },
        })
      } catch (err: any) {
        const msg = err?.error?.description || err?.message || 'Razorpay order creation failed'
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      // Record a pending payment intent
      await sb.from('payments').insert({
        user_id: user.id,
        amount: amountMinor / 100,
        currency: cur,
        status: 'pending',
        payment_method: 'razorpay',
      })

  return NextResponse.json({ ok: true, provider: 'razorpay', order, key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID })
    }

    return NextResponse.json({ error: 'unsupported type' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
