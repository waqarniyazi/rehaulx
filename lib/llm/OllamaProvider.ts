import type { LLMProvider } from "./types"

export class OllamaProvider implements LLMProvider {
  private baseUrl: string

  constructor(baseUrl = "http://localhost:11434") {
    this.baseUrl = baseUrl
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
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || ""
    } catch (error) {
      console.error("Ollama generation error:", error)
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
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: prompt,
          stream: true,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream from Ollama")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.response) {
              yield data.response
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error("Ollama streaming error:", error)
      throw error
    }
  }
}
