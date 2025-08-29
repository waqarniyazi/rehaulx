import { BarChart3, CreditCard, Target, UserCircle2 } from "lucide-react"

export const dashboardNav = [
  { title: "Overview", url: "/dashboard?tab=overview", icon: BarChart3 },
  { title: "Usage", url: "/dashboard?tab=usage", icon: Target },
  { title: "Billing", url: "/dashboard?tab=billing", icon: CreditCard },
  { title: "Personal Info", url: "/dashboard?tab=personal", icon: UserCircle2 },
]
