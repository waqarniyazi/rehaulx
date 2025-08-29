"use client"

import * as React from "react"
import {
  HelpCircleIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  FolderIcon,
  SettingsIcon,
  CreditCardIcon,
  PlusCircleIcon,
  MailIcon,
} from "lucide-react"

import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const navSecondary = React.useMemo(
    () => [
      { title: "Pricing", url: "/pricing", icon: CreditCardIcon },
      { title: "Get Help", url: "/about", icon: HelpCircleIcon },
    ],
    []
  )

  const sidebarUser = React.useMemo(
    () => ({
      name: user?.user_metadata?.full_name || user?.email || "User",
      email: user?.email || "",
      avatar: user?.user_metadata?.avatar_url || "/placeholder-user.jpg",
    }),
    [user]
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon/favicon-32x32.png" alt="ReHaulX" className="h-6 w-6 rounded" />
                <span className="text-base font-semibold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">ReHaulX</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Quick Create"
              className="hover-aurora min-w-8 bg-[linear-gradient(110deg,rgba(59,130,246,0.8),rgba(168,85,247,0.8),rgba(59,130,246,0.8))] bg-[length:200%_200%] animate-gradient-x text-white hover:opacity-90"
              onClick={() => (window.location.href = '/repurpose')}
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Home */}
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboardIcon />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Repurpose">
                  <a href="/repurpose">
                    <SparklesIcon />
                    <span>Repurpose</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="flex items-center gap-2">
              <span>Projects</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="All Projects">
                  <a href="/dashboard/projects">
                    <FolderIcon />
                    <span>All Projects</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-[linear-gradient(110deg,rgba(59,130,246,0.8),rgba(168,85,247,0.8),rgba(59,130,246,0.8))] bg-[length:200%_200%] animate-gradient-x text-white hover:opacity-90"
                  onClick={() => {
                    fetch('/api/projects', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: 'Untitled Project', contentType: 'video', status: 'draft' }),
                    })
                      .then(() => { window.location.href = '/repurpose' })
                      .catch(() => { window.location.href = '/repurpose' })
                  }}
                >
                  <PlusCircleIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 group-data-[collapsible=icon]:opacity-0"
                  onClick={() => (window.location.href = '/contact')}
                  title="Contact"
                >
                  <MailIcon className="h-4 w-4" />
                  <span className="sr-only">Contact</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Billing */}
        <SidebarGroup>
          <SidebarGroupLabel>Billing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Usage & Billing">
                  <a href="/dashboard/billing">
                    <CreditCardIcon />
                    <span>Usage & Billing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Pricing">
                  <a href="/pricing">
                    <CreditCardIcon />
                    <span>Pricing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile Settings">
                  <a href="/dashboard/settings">
                    <SettingsIcon />
                    <span>Profile</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help">
                  <a href="/about">
                    <HelpCircleIcon />
                    <span>Help</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
