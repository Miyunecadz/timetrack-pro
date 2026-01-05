import { differenceInMinutes, format } from 'date-fns'
import type { Break, TimeEntry } from '../../types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Calculate duration in minutes between two dates
 */
export function calculateDuration(start: Date, end: Date): number {
  return differenceInMinutes(end, start)
}

/**
 * Convert minutes to hours (decimal)
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate total break duration from array of breaks
 */
export function calculateBreakDuration(breaks: Break[]): number {
  return breaks.reduce((total, brk) => {
    if (brk.endTime) {
      return total + brk.duration
    }
    return total
  }, 0)
}

/**
 * Calculate billable hours from time entry
 * Billable Hours = (Total Duration - Break Duration) / 60
 */
export function calculateBillableHours(totalMinutes: number, breakMinutes: number): number {
  const billableMinutes = totalMinutes - breakMinutes
  return minutesToHours(billableMinutes)
}

/**
 * Format time duration as "X hours Y minutes" or "X hours" or "Y minutes"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${mins} minute${mins !== 1 ? 's' : ''}`
  }
}

/**
 * Format time for display (e.g., "3:45 PM")
 */
export function formatTime(date: Date, use24Hour: boolean = false): string {
  return format(date, use24Hour ? 'HH:mm' : 'h:mm a')
}

/**
 * Format date for display (e.g., "Monday, December 29, 2025")
 */
export function formatDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Format date for file names (e.g., "2025_12_29")
 */
export function formatDateForFilename(date: Date): string {
  return format(date, 'yyyy_MM_dd')
}

/**
 * Create a new break
 */
export function createBreak(startTime: Date): Break {
  return {
    id: uuidv4(),
    startTime,
    endTime: null,
    duration: 0
  }
}

/**
 * End a break and calculate its duration
 */
export function endBreak(brk: Break, endTime: Date): Break {
  const duration = calculateDuration(brk.startTime, endTime)
  return {
    ...brk,
    endTime,
    duration
  }
}

/**
 * Calculate total hours from multiple time entries
 */
export function calculateTotalHours(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => total + entry.billableHours, 0)
}

/**
 * Group time entries by date
 */
export function groupEntriesByDate(entries: TimeEntry[]): Record<string, TimeEntry[]> {
  return entries.reduce((groups, entry) => {
    const dateKey = format(entry.date, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)
}

/**
 * Split a time entry into segments based on breaks
 * Returns an array of time segments (start/end pairs) that exclude break periods
 */
export interface TimeSegment {
  start: Date
  end: Date
}

export function splitTimeRangeByBreaks(entry: TimeEntry): TimeSegment[] {
  if (!entry.clockOutTime) {
    return [{ start: entry.clockInTime, end: new Date() }]
  }

  const completedBreaks = entry.breaks.filter(brk => brk.endTime !== null)
  if (completedBreaks.length === 0) {
    return [{ start: entry.clockInTime, end: entry.clockOutTime }]
  }

  const sortedBreaks = [...completedBreaks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  const segments: TimeSegment[] = []
  let currentStart = entry.clockInTime

  for (const brk of sortedBreaks) {
    if (brk.startTime > entry.clockInTime && brk.endTime! <= entry.clockOutTime) {
      if (currentStart < brk.startTime) {
        segments.push({
          start: currentStart,
          end: brk.startTime
        })
      }
      currentStart = brk.endTime!
    }
  }

  if (currentStart < entry.clockOutTime) {
    segments.push({
      start: currentStart,
      end: entry.clockOutTime
    })
  }

  return segments
}

/**
 * Validate time entry data
 */
export function validateTimeEntry(entry: Partial<TimeEntry>): string[] {
  const errors: string[] = []

  if (!entry.clockInTime) {
    errors.push('Clock in time is required')
  }

  if (entry.clockOutTime && entry.clockInTime && entry.clockOutTime < entry.clockInTime) {
    errors.push('Clock out time must be after clock in time')
  }

  if (entry.breaks) {
    entry.breaks.forEach((brk, index) => {
      if (brk.endTime && brk.endTime < brk.startTime) {
        errors.push(`Break ${index + 1}: End time must be after start time`)
      }
    })
  }

  return errors
}
