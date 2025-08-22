import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, name, feature, useCase } = await request.json()

    if (!email || !name || !feature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Insert beta signup
    const { data, error } = await supabase.from("beta_signups").insert([
      {
        email,
        name,
        feature,
        use_case: useCase,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Beta signup error:", error)
      return NextResponse.json({ error: "Failed to join beta" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Beta signup error:", error)
    return NextResponse.json({ error: "Failed to join beta" }, { status: 500 })
  }
}
