import { format, startOfWeek, endOfWeek, subDays, addDays } from 'date-fns'
import type { TimeEntry, Task } from '../../types'
import { TaskStatus } from '../../enums'
import { formatTime, formatDate, minutesToHours } from './timeUtils'

// ============================================================================
// REPORT 1: Hours Completed Report
// ============================================================================

export interface HoursReportData {
  date: Date
  entries: TimeEntry[]
  totalHours: number
}

export function generateHoursReport(data: HoursReportData): string {
  const { date, entries, totalHours } = data

  if (entries.length === 0) {
    return `Hours Completed (${format(date, 'EEEE MMM d, yyyy')})\nNo hours logged for this day.`
  }

  const dateHeader = `Hours Completed (${format(date, 'EEEE MMM d, yyyy')})`

  const timeBlocks = entries.map(entry => {
    const start = formatTime(entry.clockInTime)
    const end = entry.clockOutTime ? formatTime(entry.clockOutTime) : 'In Progress'
    const duration = entry.clockOutTime
      ? `${minutesToHours(entry.totalDuration - entry.breakDuration)} hours`
      : 'In Progress'

    return `${start} - ${end} (${duration})`
  }).join('\n')

  const total = `Total Hours: ${totalHours.toFixed(1)} Hours`

  return `${dateHeader}\n${timeBlocks}\n${total}`
}

// ============================================================================
// REPORT 2: Progress Tracker (Daily Standup)
// ============================================================================

export interface ProgressTrackerData {
  previousDayTasks: Task[]
  todayTasks: Task[]
  blockedTasks: Task[]
}

export function generateProgressTracker(data: ProgressTrackerData): string {
  const { previousDayTasks, todayTasks, blockedTasks } = data

  const sections: string[] = []

  // Previous Day's Progress
  sections.push("Previous Day's Progress")
  if (previousDayTasks.length === 0) {
    sections.push("- No tasks completed")
  } else {
    previousDayTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }

  sections.push("") // Empty line

  // To Do
  sections.push("To Do:")
  const todoTasks = todayTasks.filter(
    t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
  )
  if (todoTasks.length === 0) {
    sections.push("- No tasks planned")
  } else {
    todoTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }

  sections.push("") // Empty line

  // Blocker
  sections.push("Blocker:")
  if (blockedTasks.length === 0) {
    sections.push("- None")
  } else {
    blockedTasks.forEach(task => {
      const reason = task.blockerReason ? ` - ${task.blockerReason}` : ''
      sections.push(`- ${task.description}${reason}`)
    })
  }

  return sections.join('\n')
}

// ============================================================================
// REPORT 3: End of Day Report
// ============================================================================

export interface DailyReportData {
  date: Date
  completedTasks: Task[]
  tasksWithChallenges: Task[]
  tomorrowTasks: Task[]
}

export function generateDailyReport(data: DailyReportData): string {
  const { date, completedTasks, tasksWithChallenges, tomorrowTasks } = data

  const sections: string[] = []

  // Header
  sections.push("Daily Report")
  sections.push(format(date, 'EEEE, MMMM d, yyyy'))
  sections.push("")

  // A. Tasks Completed
  sections.push("A. Task Completed.")
  if (completedTasks.length === 0) {
    sections.push("- No tasks completed")
  } else {
    completedTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }
  sections.push("")

  // B. Challenges Encountered
  sections.push("B. Challenges Encountered.")
  if (tasksWithChallenges.length === 0) {
    sections.push("- None")
  } else {
    tasksWithChallenges.forEach(task => {
      task.challengesEncountered.forEach(challenge => {
        sections.push(`- ${challenge}`)
      })
    })
  }
  sections.push("")

  // C. Goals for Next Day
  sections.push("C. Goals for the Next Day.")
  if (tomorrowTasks.length === 0) {
    sections.push("- No goals set")
  } else {
    tomorrowTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }

  return sections.join('\n')
}

// ============================================================================
// REPORT 4: Weekly Report
// ============================================================================

export interface WeeklyReportData {
  weekStart: Date
  weekEnd: Date
  plannedTasks: Task[]
  completedTasks: Task[]
  inProgressTasks: Task[]
  nextWeekTasks: Task[]
}

export function generateWeeklyReport(data: WeeklyReportData): string {
  const { weekStart, weekEnd, plannedTasks, completedTasks, inProgressTasks, nextWeekTasks } = data

  const sections: string[] = []

  // Header
  sections.push("Weekly Report")
  sections.push(`Week ${format(weekStart, 'yyyy-MM-dd')} → ${format(weekEnd, 'yyyy-MM-dd')}`)
  sections.push("")

  // Objectives (Planned)
  sections.push("Objectives (Planned)")
  if (plannedTasks.length === 0) {
    sections.push("- No objectives planned")
  } else {
    plannedTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }
  sections.push("")

  // Deliverables (Completed)
  sections.push("Deliverables (Completed)")
  if (completedTasks.length === 0) {
    sections.push("- No tasks completed this week")
  } else {
    completedTasks.forEach(task => {
      sections.push(`- ✅ ${task.description}`)
    })
  }
  sections.push("")

  // In-Progress / Not Completed
  sections.push("In-Progress / Not Completed")
  if (inProgressTasks.length === 0) {
    sections.push("- None")
  } else {
    inProgressTasks.forEach(task => {
      const percentage = task.completionPercentage > 0
        ? ` (${task.completionPercentage}% complete)`
        : ''
      sections.push(`- 🔄 ${task.description}${percentage}`)
    })
  }
  sections.push("")

  // Action Plan for Next Week
  sections.push("Action Plan for Next Week")
  if (nextWeekTasks.length === 0) {
    sections.push("- Continue with current objectives")
  } else {
    nextWeekTasks.forEach(task => {
      sections.push(`- ${task.description}`)
    })
  }

  return sections.join('\n')
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getTasksForReport(
  tasks: Task[],
  date: Date,
  status?: TaskStatus
): Task[] {
  return tasks.filter(task => {
    const matchesDate = format(task.plannedFor, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    const matchesStatus = status ? task.status === status : true
    return matchesDate && matchesStatus && !task.deletedAt
  })
}

export function getCompletedTasksForDate(tasks: Task[], date: Date): Task[] {
  return tasks.filter(task =>
    task.status === TaskStatus.COMPLETED &&
    task.completedOn &&
    format(task.completedOn, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
    !task.deletedAt
  )
}

export function getTasksForWeek(tasks: Task[], weekStart: Date): Task[] {
  const weekEnd = endOfWeek(weekStart)
  return tasks.filter(task => {
    const taskDate = task.plannedFor
    return taskDate >= weekStart && taskDate <= weekEnd && !task.deletedAt
  })
}

export function getCompletedTasksForWeek(tasks: Task[], weekStart: Date): Task[] {
  const weekEnd = endOfWeek(weekStart)
  return tasks.filter(task =>
    task.status === TaskStatus.COMPLETED &&
    task.completedOn &&
    task.completedOn >= weekStart &&
    task.completedOn <= weekEnd &&
    !task.deletedAt
  )
}
