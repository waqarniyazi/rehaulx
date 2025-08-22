import type { LLMProvider } from "./types"

export class DeepSeekProvider implements LLMProvider {
  private apiKey: string
  private baseUrl = "https://api.deepseek.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generate(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    },
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ""
    } catch (error) {
      console.error("DeepSeek generation error:", error)
      throw error
    }
  }

  async *generateStream(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
    },
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream from DeepSeek")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() && line.startsWith("data: "))

        for (const line of lines) {
          const data = line.replace("data: ", "")
          if (data === "[DONE]") return

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error("DeepSeek streaming error:", error)
      throw error
    }
  }
}
