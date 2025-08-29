import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanById } from '@/lib/billing'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature') || ''
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })

    const rawBody = await request.text()
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

  const event = JSON.parse(rawBody)
  const admin = createAdminClient()

    // Prefer payment.captured (contains payment entity with notes)
    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      if (!payment) return NextResponse.json({ ok: true })
      const user_id = payment.notes?.user_id
      const addonMinutes = Number(payment.notes?.addon_minutes || 0)
      const planId = Number(payment.notes?.plan_id || 0)
      const billingCycle = (payment.notes?.billing_cycle || 'monthly') as 'monthly' | 'yearly'
      const amount = Number(payment.amount || 0) / 100
      const currency = payment.currency || 'USD'

      if (!user_id) return NextResponse.json({ ok: true })

      // Create payment row if not exists
      await admin.from('payments').upsert({
        user_id,
        razorpay_payment_id: payment.id,
        amount,
        currency,
        status: 'completed',
        payment_method: 'razorpay',
      }, { onConflict: 'razorpay_payment_id' })

  // Create purchase and credit minutes for add-ons
      if (addonMinutes > 0) {
        await admin.from('purchases').insert({
          user_id,
          purchase_type: 'addon_minutes',
          minutes_purchased: addonMinutes,
          amount_paid: amount,
          currency,
          razorpay_payment_id: payment.id,
          status: 'completed',
        })

        // Credit minutes into user_usage bucket
        await admin.from('user_usage').insert({
          user_id,
          allocated_minutes: addonMinutes,
          used_minutes: 0,
          remaining_minutes: addonMinutes,
          source: 'addon',
          cycle_start: null,
          cycle_end: null,
        })
      }

      // Activate subscription purchases
      if (planId > 0) {
        const plan = await getPlanById(planId)
        if (plan) {
          // Create subscription row
          const now = new Date()
          const end = new Date(now)
          if (billingCycle === 'yearly') end.setFullYear(end.getFullYear() + 1)
          else end.setMonth(end.getMonth() + 1)

          await admin.from('subscriptions').insert({
            user_id,
            plan_id: plan.id,
            billing_cycle: billingCycle,
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            razorpay_subscription_id: null,
            status: 'active',
          })

          // Credit plan minutes for the cycle
          const minutes = billingCycle === 'yearly' ? plan.minutes_yearly : plan.minutes_monthly
          await admin.from('user_usage').insert({
            user_id,
            allocated_minutes: minutes,
            used_minutes: 0,
            remaining_minutes: minutes,
            source: 'subscription',
            cycle_start: now.toISOString(),
            cycle_end: end.toISOString(),
          })

          // Record purchase
          await admin.from('purchases').insert({
            user_id,
            purchase_type: 'plan_upgrade',
            minutes_purchased: minutes,
            amount_paid: amount,
            currency,
            razorpay_payment_id: payment.id,
            status: 'completed',
          })
        }
      }
      return NextResponse.json({ ok: true })
    }

    // Other events can be handled later
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 })
  }
}
