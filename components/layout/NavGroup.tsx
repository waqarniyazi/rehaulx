"use client"

import Link from "next/link"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

export type NavGroupProps = {
  items: NavItem[]
  currentPath: string
  onNavigate?: () => void
}

export function NavGroup({ items, currentPath, onNavigate }: NavGroupProps) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = currentPath === item.url
        return (
          <SidebarMenuItem key={`${item.title}-${item.url}`}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.url} onClick={onNavigate} className="flex items-center gap-2">
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.title}</span>
                {item.badge ? (
                  <span className="ml-auto text-xs rounded-md px-1 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )}
