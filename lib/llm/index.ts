import type { LLMProvider, LLMProviderType } from "./types"
import { OllamaProvider } from "./OllamaProvider"
import { DeepSeekProvider } from "./DeepSeekProvider"

export function getLLMProvider(provider?: LLMProviderType): LLMProvider {
  const providerType = provider || (process.env.LLM_PROVIDER as LLMProviderType) || "ollama"

  switch (providerType) {
    case "deepseek":
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY
      if (!deepseekApiKey) {
        throw new Error("DEEPSEEK_API_KEY environment variable is required for DeepSeek provider")
      }
      return new DeepSeekProvider(deepseekApiKey)

    case "ollama":
    default:
      const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
      return new OllamaProvider(ollamaBaseUrl)
  }
}

// Example usage:
// const provider = getLLMProvider(process.env.LLM_PROVIDER as "ollama" | "deepseek");
// const result = await provider.generate("Analyze this TypeScript code...");

export * from "./types"
export { OllamaProvider } from "./OllamaProvider"
export { DeepSeekProvider } from "./DeepSeekProvider"
