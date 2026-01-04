export const ReportType = {
  HOURS: 'hours',
  PROGRESS_TRACKER: 'progress-tracker',
  DAILY: 'daily',
  WEEKLY: 'weekly'
} as const

export type ReportType = typeof ReportType[keyof typeof ReportType]
