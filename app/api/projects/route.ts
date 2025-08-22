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

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error("Projects fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, contentType, videoUrl, thumbnail, content, keyFrames, status } = await request.json()

    if (!userId || !title || !contentType || !videoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        title,
        content_type: contentType,
        video_url: videoUrl,
        thumbnail,
        content,
        key_frames: keyFrames,
        status: status || "completed",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Project creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
