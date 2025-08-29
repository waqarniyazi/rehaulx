"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/layout/AppSidebar"
import {
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
} from "@/components/ui/sidebar"
import { NavGroup } from "@/components/layout/NavGroup"
import { dashboardNav } from "@/components/layout/nav-data"

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const search = useSearchParams()
  const currentPath = `${pathname}?${search?.toString() ?? ""}`

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar>
        <SidebarHeader />
        <SidebarContent>
          <NavGroup items={dashboardNav} currentPath={currentPath} />
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
