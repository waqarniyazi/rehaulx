"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/Breadcrumbs"

type MinutesRes = {
  remaining: number
  allocated: number
  used: number
  cycle_end: string | null
}

export default function BillingPage() {
  const [minutes, setMinutes] = useState<MinutesRes | null>(null)

  useEffect(() => {
    fetch("/api/minutes", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMinutes)
      .catch(() => {})
  }, [])

  const allocated = minutes?.allocated ?? 0
  const used = minutes?.used ?? 0
  const remaining = minutes?.remaining ?? Math.max(allocated - used, 0)
  const usedPct = allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0

  const buyAddon = async (addon: number) => {
    await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'addon', addon_minutes: addon, currency: 'INR' }),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 lg:px-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
        <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-white font-semibold">Usage</div>
          <div className="text-white/60 text-sm">This cycle {minutes?.cycle_end ? `(ends ${new Date(minutes.cycle_end).toLocaleDateString()})` : ''}</div>
          <div className="mt-4">
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${usedPct}%` }} />
            </div>
            <div className="flex justify-between text-white/70 text-sm mt-2">
              <span>Used: {used}m</span>
              <span>Remaining: {remaining}m</span>
              <span>Allocated: {allocated}m</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-white font-semibold">Manage</div>
          <div className="text-white/60 text-sm">Top up minutes or change your plan.</div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => buyAddon(50)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">+50 min</Button>
            <Button onClick={() => buyAddon(100)} variant="outline" className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 hover:border-white/30">+100 min</Button>
            <Button onClick={() => (window.location.href = '/pricing')} variant="outline" className="ml-auto bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 hover:border-white/30">See Plans</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
