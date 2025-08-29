"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import Script from "next/script"
import { Breadcrumbs } from "@/components/Breadcrumbs"

type MinutesRes = {
  remaining: number
  allocated: number
  used: number
  cycle_end: string | null
  subscription: any
  upgrade_nudge?: { show: boolean; reason: string; recommendedPlan?: string }
}

type Project = {
  id: string
  title: string
  content_type: string
  status: string
  created_at: string
}

export default function Page() {
  const { user } = useAuth()
  const [minutes, setMinutes] = useState<MinutesRes | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const [mRes, pRes] = await Promise.all([
          fetch("/api/minutes", { cache: "no-store" }),
          fetch("/api/projects", { cache: "no-store" }),
        ])
        if (!mRes.ok) throw new Error("Failed to load minutes")
        if (!pRes.ok) throw new Error("Failed to load projects")
        const m = (await mRes.json()) as MinutesRes
        const p = (await pRes.json()) as { projects: Project[] }
        if (!mounted) return
        setMinutes(m)
        setProjects(p.projects || [])
      } catch (e: any) {
        console.error(e)
        if (mounted) setErr(e.message || "Failed to load dashboard")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const totals = useMemo(() => {
    const totalProjects = projects.length
    const totalWords = projects.reduce((sum: number, p: any) => {
      if (p?.content && typeof p.content === 'string') {
        const words = p.content.trim().split(/\s+/).length
        return sum + words
      }
      return sum
    }, 0)
    return { totalProjects, totalWords }
  }, [projects])

  const buyAddon = async (minutes: number) => {
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'addon', addon_minutes: minutes, currency: 'USD' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      // Open Razorpay Checkout
      // Expect NEXT_PUBLIC_RAZORPAY_KEY_ID to be set
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string | undefined
      // Fallback to window var if injected elsewhere
      const rzpKey = key || (typeof window !== 'undefined' && (window as any).RAZORPAY_KEY_ID)
      if (!rzpKey) {
        alert('Razorpay key missing')
        return
      }

      const options = {
        key: rzpKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'ReHaulX',
        description: `${minutes} minutes add-on`,
        order_id: data.order.id,
        handler: function () {
          // On success, reload minutes
          fetch('/api/minutes', { cache: 'no-store' }).then(r => r.json()).then(setMinutes).catch(() => {})
        },
        prefill: {
          email: user?.email,
          name: user?.user_metadata?.full_name || user?.email,
        },
        theme: { color: '#2563eb' },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Unable to start checkout')
    }
  }

  return (
    <>
      {/* Razorpay Checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-6">
          <div className="px-4 lg:px-6 -mt-4">
            <Breadcrumbs items={[{ label: "Dashboard" }]} />
          </div>
          {/* Top metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Remaining Minutes</div>
                <div className="text-3xl font-semibold text-white mt-1">{minutes?.remaining ?? '—'}</div>
                {minutes?.upgrade_nudge?.show && (
                  <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">{minutes.upgrade_nudge.reason.replaceAll('_',' ')}</Badge>
                )}
              </Card>
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Allocated</div>
                <div className="text-3xl font-semibold text-white mt-1">{minutes?.allocated ?? '—'}</div>
              </Card>
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Used</div>
                <div className="text-3xl font-semibold text-white mt-1">{minutes?.used ?? '—'}</div>
              </Card>
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Projects</div>
                <div className="text-3xl font-semibold text-white mt-1">{totals.totalProjects}</div>
              </Card>
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Total words generated</div>
                <div className="text-2xl font-semibold text-white mt-1">{totals.totalWords}</div>
              </Card>
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm">Subscription</div>
                <div className="text-white mt-1">
                  {minutes?.subscription?.plan?.display_name ? (
                    <>
                      <div className="text-lg font-semibold">{minutes.subscription.plan.display_name}</div>
                      <div className="text-white/60 text-sm">Cycle ends {minutes?.cycle_end ? new Date(minutes.cycle_end).toLocaleDateString() : '—'}</div>
                    </>
                  ) : (
                    <span className="text-white/60">Free plan</span>
                  )}
                </div>
              </Card>
              <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="text-white/60 text-sm mb-2">Usage</div>
                {(() => {
                  const allocated = minutes?.allocated ?? 0
                  const used = minutes?.used ?? 0
                  const usedPct = allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0
                  return (
                    <>
                      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${usedPct}%` }} />
                      </div>
                      <div className="flex justify-between text-white/70 text-xs mt-2">
                        <span>Used {used}m</span>
                        <span>Alloc {allocated}m</span>
                      </div>
                    </>
                  )
                })()}
              </Card>
          </div>

          {/* Billing actions */}
          <div className="px-4 lg:px-6">
              <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10">
                <div>
                  <div className="text-white font-medium">Need more minutes?</div>
                  <div className="text-white/60 text-sm">Buy quick add-ons or upgrade your plan on the pricing page.</div>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <Button onClick={() => buyAddon(50)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">+50 min ($5)</Button>
                  <Button onClick={() => buyAddon(100)} variant="outline" className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 hover:border-white/30">+100 min ($10)</Button>
                </div>
              </Card>
          </div>

          {/* Projects table (compact) */}
          <div className="px-4 lg:px-6">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="text-white font-semibold">Recent Projects</div>
                  <Button variant="outline" className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 hover:border-white/30" onClick={() => (window.location.href = '/repurpose')}>New Project</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-white/60">
                      <tr>
                        <th className="text-left px-4 py-2">Title</th>
                        <th className="text-left px-4 py-2">Type</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-left px-4 py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="px-4 py-4 text-white/60" colSpan={4}>Loading…</td>
                        </tr>
                      ) : projects.length === 0 ? (
                        <tr>
                          <td className="px-4 py-4 text-white/60" colSpan={4}>No projects yet</td>
                        </tr>
                      ) : (
                        projects.slice(0, 8).map((p) => (
                          <tr key={p.id} className="border-t border-white/10">
                            <td className="px-4 py-3 text-white">{p.title}</td>
                            <td className="px-4 py-3 text-white/80">{p.content_type}</td>
                            <td className="px-4 py-3">
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{p.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-white/60">{new Date(p.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
          </div>

          {err && (
            <div className="px-4 lg:px-6">
              <Card className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-300">{err}</Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
