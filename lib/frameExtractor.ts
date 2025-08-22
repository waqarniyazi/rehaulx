export interface ExtractedFrame {
  timestamp: number
  dataUrl: string
}

export async function extractFramesFromVideo(
  videoUrl: string,
  timestamps: number[],
): Promise<Record<number, string[]>> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    video.crossOrigin = "anonymous"
    video.src = videoUrl

    const frames: Record<number, string[]> = {}

    video.onloadedmetadata = async () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      try {
        for (const timestamp of timestamps) {
          const timestampFrames: string[] = []

          // Extract 3 frames: t-0.5s, t, t+0.5s
          const offsets = [-0.5, 0, 0.5]

          for (const offset of offsets) {
            const seekTime = Math.max(0, timestamp + offset)
            video.currentTime = seekTime

            await new Promise<void>((resolveSeek) => {
              video.onseeked = () => resolveSeek()
            })

            ctx.drawImage(video, 0, 0)
            const dataURL = canvas.toDataURL("image/jpeg", 0.8)
            timestampFrames.push(dataURL)
          }

          frames[timestamp] = timestampFrames
        }

        resolve(frames)
      } catch (error) {
        reject(error)
      }
    }

    video.onerror = () => reject(new Error("Failed to load video"))
  })
}
