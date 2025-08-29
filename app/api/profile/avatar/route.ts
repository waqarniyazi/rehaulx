import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const server = await createClient()
    const { data: { user } } = await server.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file missing" }, { status: 400 })

    const admin = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const path = `${user.id}/${Date.now()}_${file.name}`
    const { error } = await admin.storage.from("avatars").upload(path, Buffer.from(arrayBuffer), { upsert: true, contentType: file.type })
    if (error) throw error
    const { data } = admin.storage.from("avatars").getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e: any) {
    console.error("avatar upload error", e)
    return NextResponse.json({ error: e.message || "failed" }, { status: 500 })
  }
}
