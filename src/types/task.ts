import { TaskCategory, TaskStatus, Priority } from '../enums'

export interface Task {
  id?: number
  userId: string
  description: string
  enhancedDescription: string
  category: TaskCategory
  ticketNumber: string | null
  status: TaskStatus
  completionPercentage: number
  priority: Priority
  isBlocker: boolean
  blockerReason: string
  timeEntryId: number | null
  startTime: Date | null
  endTime: Date | null
  estimatedDuration: number // Minutes
  actualDuration: number // Minutes
  plannedFor: Date
  completedOn: Date | null
  dueDate: Date | null
  carryOver: boolean
  challengesEncountered: string[]
  technicalDetails: string
  notes: string
  links: string[]
  tags: string[]
  project: string
  feature: string
  aiEnhanced: boolean
  aiProvider: string | null
  aiConfidence: number
  userApprovedAI: boolean
  originalBeforeAI: string
  postedToSlack: boolean
  slackMessageId: string | null
  slackChannel: string | null
  slackTimestamp: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
