export interface LLMProvider {
  generate(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    },
  ): Promise<string>

  generateStream(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
    },
  ): AsyncGenerator<string, void, unknown>
}

export type LLMProviderType = "ollama" | "deepseek"
