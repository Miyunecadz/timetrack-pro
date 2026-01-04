import { create } from 'zustand'
import type { TimeEntry, Break } from '../types'
import { timeEntryRepository } from '../lib/repositories'
import { DEFAULT_USER_ID } from '../lib/db'
import { calculateDuration, calculateBreakDuration, calculateBillableHours, createBreak, endBreak } from '../lib/utils/timeUtils'

interface TimeTrackingState {
  // State
  activeSession: TimeEntry | null
  timeEntries: TimeEntry[]
  isLoading: boolean
  error: string | null
  currentTime: Date

  // Actions
  clockIn: () => Promise<void>
  clockOut: () => Promise<void>
  startBreak: () => Promise<void>
  endBreakAction: () => Promise<void>
  loadActiveSession: () => Promise<void>
  loadTimeEntries: (start?: Date, end?: Date) => Promise<void>
  updateCurrentTime: () => void
  reset: () => void
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  activeSession: null,
  timeEntries: [],
  isLoading: false,
  error: null,
  currentTime: new Date(),

  clockIn: async () => {
    try {
      set({ isLoading: true, error: null })

      // Check if already clocked in
      const existing = await timeEntryRepository.getActiveSession()
      if (existing) {
        set({ error: 'Already clocked in', isLoading: false })
        return
      }

      const now = new Date()
      const entry: Omit<TimeEntry, 'id'> = {
        userId: DEFAULT_USER_ID,
        clockInTime: now,
        clockOutTime: null,
        date: now,
        breaks: [],
        totalDuration: 0,
        breakDuration: 0,
        billableHours: 0,
        status: 'active',
        isManualEntry: false,
        editedAt: null,
        notes: '',
        createdAt: now,
        updatedAt: now
      }

      const id = await timeEntryRepository.create(entry)
      const created = await timeEntryRepository.getById(id)

      set({ activeSession: created || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  clockOut: async () => {
    try {
      set({ isLoading: true, error: null })

      const { activeSession } = get()
      if (!activeSession || !activeSession.id) {
        set({ error: 'No active session', isLoading: false })
        return
      }

      const now = new Date()
      const totalDuration = calculateDuration(activeSession.clockInTime, now)
      const breakDuration = calculateBreakDuration(activeSession.breaks)
      const billableHours = calculateBillableHours(totalDuration, breakDuration)

      // End any active break first
      const breaks = activeSession.breaks.map(brk =>
        brk.endTime === null ? endBreak(brk, now) : brk
      )

      await timeEntryRepository.update(activeSession.id, {
        clockOutTime: now,
        totalDuration,
        breakDuration: calculateBreakDuration(breaks),
        billableHours,
        breaks,
        status: 'completed',
        updatedAt: now
      })

      set({ activeSession: null, isLoading: false })

      // Reload entries
      await get().loadTimeEntries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  startBreak: async () => {
    try {
      set({ isLoading: true, error: null })

      const { activeSession } = get()
      if (!activeSession || !activeSession.id) {
        set({ error: 'No active session', isLoading: false })
        return
      }

      // Check if there's already an active break
      const hasActiveBreak = activeSession.breaks.some(brk => brk.endTime === null)
      if (hasActiveBreak) {
        set({ error: 'Break already in progress', isLoading: false })
        return
      }

      const newBreak = createBreak(new Date())
      const updatedBreaks = [...activeSession.breaks, newBreak]

      await timeEntryRepository.update(activeSession.id, {
        breaks: updatedBreaks,
        updatedAt: new Date()
      })

      const updated = await timeEntryRepository.getById(activeSession.id)
      set({ activeSession: updated || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  endBreakAction: async () => {
    try {
      set({ isLoading: true, error: null })

      const { activeSession } = get()
      if (!activeSession || !activeSession.id) {
        set({ error: 'No active session', isLoading: false })
        return
      }

      const activeBreakIndex = activeSession.breaks.findIndex(brk => brk.endTime === null)
      if (activeBreakIndex === -1) {
        set({ error: 'No active break', isLoading: false })
        return
      }

      const now = new Date()
      const updatedBreaks = activeSession.breaks.map(brk =>
        brk.endTime === null ? endBreak(brk, now) : brk
      )

      const breakDuration = calculateBreakDuration(updatedBreaks)

      await timeEntryRepository.update(activeSession.id, {
        breaks: updatedBreaks,
        breakDuration,
        updatedAt: now
      })

      const updated = await timeEntryRepository.getById(activeSession.id)
      set({ activeSession: updated || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadActiveSession: async () => {
    try {
      set({ isLoading: true, error: null })
      const session = await timeEntryRepository.getActiveSession()
      set({ activeSession: session || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadTimeEntries: async (start?: Date, end?: Date) => {
    try {
      set({ isLoading: true, error: null })
      const entries = start && end
        ? await timeEntryRepository.getEntriesInRange(start, end)
        : await timeEntryRepository.getAll()
      set({ timeEntries: entries, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateCurrentTime: () => {
    set({ currentTime: new Date() })
  },

  reset: () => {
    set({
      activeSession: null,
      timeEntries: [],
      isLoading: false,
      error: null,
      currentTime: new Date()
    })
  }
}))
