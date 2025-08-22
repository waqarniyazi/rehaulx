export interface TranscriptItem {
  text: string
  start: number
  duration: number
}

export async function getYouTubeTranscript(videoId: string): Promise<TranscriptItem[]> {
  try {
    const response = await fetch(`/api/transcript?url=https://www.youtube.com/watch?v=${videoId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch transcript")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error)
    throw error
  }
}

export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
