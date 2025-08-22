import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get project count
    const { count: totalProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get projects for calculating stats
    const { data: projects } = await supabase
      .from("projects")
      .select("views, engagement, created_at")
      .eq("user_id", userId)

    const totalViews = projects?.reduce((sum, project) => sum + (project.views || 0), 0) || 0
    const avgEngagement = projects?.length
      ? projects.reduce((sum, project) => sum + (project.engagement || 0), 0) / projects.length
      : 0

    // Calculate time saved (estimate 2 hours per project)
    const timeSaved = (totalProjects || 0) * 2

    const stats = {
      totalProjects: totalProjects || 0,
      totalViews,
      avgEngagement: Math.round(avgEngagement * 10) / 10,
      timeSaved,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
