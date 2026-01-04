export interface AIUsage {
  id?: number
  provider: string
  original: string
  enhanced: string
  estimatedCost: number
  tokensUsed: number
  duration: number
  timestamp: Date
  userId: string
}
