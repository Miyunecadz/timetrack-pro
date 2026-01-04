import { ReportType } from '../enums'

export interface AIEnhancement {
  fieldName: string
  original: string
  enhanced: string
  accepted: boolean
  timestamp: Date
  tokensUsed: number
  cost: number
}

export interface Report {
  id?: number
  userId: string
  type: ReportType
  date: Date
  weekRange: {
    start: Date
    end: Date
  } | null
  content: string // Markdown
  slackBlocks: any[] // Slack JSON
  aiEnhanced: boolean
  aiProvider: string | null
  enhancementLog: AIEnhancement[]
  postedToSlack: boolean
  slackChannels: string[]
  slackMessageIds: string[]
  slackTimestamp: Date | null
  taskIds: number[]
  totalTasks: number
  completedTasks: number
  hoursWorked: number
  createdAt: Date
  updatedAt: Date
}
