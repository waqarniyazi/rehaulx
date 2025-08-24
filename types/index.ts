export interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: string
  url: string
  videoId: string
  transcript: TranscriptSegment[]
  author: string
  viewCount: string
  uploadDate: string
}

export interface KeyFrame {
  timestamp: number
  description: string
  imageUrl?: string
}

export interface GeneratedContent {
  blog: string
  linkedin: string
  twitter: string
  newsletter: string
}
