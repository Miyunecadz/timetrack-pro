export interface Break {
  id: string
  startTime: Date
  endTime: Date | null
  duration: number // Minutes
}

export interface TimeEntry {
  id?: number
  userId: string
  clockInTime: Date
  clockOutTime: Date | null
  date: Date
  breaks: Break[]
  totalDuration: number // Minutes
  breakDuration: number // Minutes
  billableHours: number // Hours
  status: 'active' | 'completed'
  isManualEntry: boolean
  editedAt: Date | null
  notes: string
  createdAt: Date
  updatedAt: Date
}
