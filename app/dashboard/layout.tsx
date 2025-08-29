"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
  <main className="min-h-screen bg-black">
        <div className="px-4 lg:px-6 pt-4 flex items-center gap-2">
          <SidebarTrigger />
        </div>
        <div className="pb-8">{children}</div>
      </main>
    </SidebarProvider>
  )
}
