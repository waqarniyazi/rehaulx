import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { ceilMinutes, deductUserMinutes, getUserMinutesBalance } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 })
    }

    console.log("Analyzing video via Heroku service:", url)

    // Call the Heroku video service
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL || 'http://localhost:3001'
    
    const response = await fetch(`${videoServiceUrl}/api/analyze-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`Video service responded with status: ${response.status}`)
    }

    const result = await response.json()

    // Deduct minutes based on video duration
    try {
  const sb = await createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const seconds = result?.videoInfo?.duration_seconds || result?.videoInfo?.duration || 0
        const minutes = ceilMinutes(Number(seconds) || 0)
        if (minutes > 0) {
          const usage = await getUserMinutesBalance(user.id)
          if ((usage?.remaining || 0) <= 0 || (usage?.remaining || 0) < minutes) {
            return NextResponse.json({
              error: 'insufficient_minutes',
              message: 'You have insufficient minutes. Please buy add-ons or upgrade your plan.',
              needed: minutes,
              remaining: usage?.remaining || 0,
            }, { status: 402 })
          }
          await deductUserMinutes(
            user.id,
            minutes,
            result?.videoInfo?.videoId || undefined,
            result?.videoInfo?.title || undefined,
            seconds,
            'analyze-video'
          )
        }
      }
    } catch (e) {
      console.error('Minutes deduction failed:', e)
    }
    
    console.log("Video analysis complete via Heroku service")
    
  return NextResponse.json(result)
  } catch (error) {
    console.error("Video analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
