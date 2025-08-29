"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Target,
  UserCircle2,
  CircleDollarSign,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type DashboardSection = "overview" | "usage" | "billing" | "personal"

type MinutesInfo = {
  allocated: number
  used: number
  remaining: number
  cycle_end?: string | null
} | null

type AdminSidebarProps = {
  className?: string
  section: DashboardSection
  onChange: (s: DashboardSection) => void
  usage: MinutesInfo
  usagePercent?: number
  onBuyAddon?: (minutes: number) => void
}

export function AdminSidebar({
  className,
  section,
  onChange,
  usage,
  usagePercent = 0,
  onBuyAddon,
}: AdminSidebarProps) {
  const items = useMemo(
    () => [
      { key: "overview" as const, label: "Overview", icon: BarChart3 },
      { key: "usage" as const, label: "Usage", icon: Target },
      { key: "billing" as const, label: "Billing", icon: CreditCard },
      { key: "personal" as const, label: "Personal Info", icon: UserCircle2 },
    ],
    []
  )

  return (
    <aside className={cn("space-y-4", className)}>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {items.map((item) => {
            const Icon = item.icon
            const active = section === item.key
            const classes = active
              ? "bg-white/15 border-white/30"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            return (
              <button
                key={item.key}
                className={cn(
                  "w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 text-white/80 mb-2",
                  classes
                )}
                onClick={() => onChange(item.key)}
              >
                <Icon className="h-4 w-4 text-white/80" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-sm text-white/70">
            {usage?.used ?? 0} used · {usage?.remaining ?? 0} remaining
          </div>
          <Progress value={usagePercent} className="h-2 bg-white/10" />
          <div className="mt-4 space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              onClick={() => onBuyAddon?.(50)}
            >
              <CircleDollarSign className="mr-2 h-4 w-4" /> Buy 50 minutes
            </Button>
            <Button
              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
              onClick={() => onBuyAddon?.(100)}
            >
              <CircleDollarSign className="mr-2 h-4 w-4" /> Buy 100 minutes
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10 transition-all duration-300"
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="h-4 w-4" /> Menu
      <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">New</Badge>
    </button>
  )
}
