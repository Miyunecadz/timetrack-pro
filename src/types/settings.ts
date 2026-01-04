export interface Settings {
  id?: number
  userId: string
  key: string
  value: any
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  name: string
  email: string
  company: string
  location: string
  timezone: string
}

export interface InvoiceSettings {
  hourlyRate: number
  defaultPayoutHours: number
  companyName: string
  companyAddress: string
  companyABN: string
  personalName: string
  personalAddress: string
  bankName: string
  bankBSB: string
  bankAccount: string
  lastInvoiceNumber: string
}

export interface AISettings {
  selectedProvider: string
  claudeApiKey: string
  openaiApiKey: string
  groqApiKey: string
  ollamaBaseURL: string
  ollamaModel: string
  tone: 'professional' | 'casual' | 'technical'
  detailLevel: 'concise' | 'moderate' | 'detailed'
  monthlyBudget: number
}

export interface SlackSettings {
  hoursReportingWebhook: string
  dayReportingWebhook: string
  weekReportingWebhook: string
  autoPostDaily: boolean
  autoPostWeekly: boolean
  reminderTime: string // "17:00"
  timezone: string
}

export interface AppPreferences {
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark' | 'system'
}
