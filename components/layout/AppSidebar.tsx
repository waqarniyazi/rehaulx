"use client"

import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  // For future variants/collapsible controls, we can pass props through.
  return <Sidebar {...props} />
}
