import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const updates = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data: project, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select()
      .single()

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
