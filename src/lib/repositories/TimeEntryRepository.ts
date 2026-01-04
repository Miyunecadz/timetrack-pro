import { startOfDay, endOfDay } from 'date-fns'
import { db, DEFAULT_USER_ID } from '../db'
import type { TimeEntry } from '../../types'

export class TimeEntryRepository {
  async getActiveSession(userId: string = DEFAULT_USER_ID): Promise<TimeEntry | undefined> {
    return await db.timeEntries
      .where({ userId, status: 'active' })
      .first()
  }

  async getEntriesForDate(date: Date, userId: string = DEFAULT_USER_ID): Promise<TimeEntry[]> {
    const start = startOfDay(date)
    const end = endOfDay(date)

    return await db.timeEntries
      .where('userId').equals(userId)
      .and(e => e.date >= start && e.date <= end)
      .toArray()
  }

  async getEntriesInRange(start: Date, end: Date, userId: string = DEFAULT_USER_ID): Promise<TimeEntry[]> {
    return await db.timeEntries
      .where('userId').equals(userId)
      .and(e => e.date >= start && e.date <= end)
      .toArray()
  }

  async getTotalHours(start: Date, end: Date, userId: string = DEFAULT_USER_ID): Promise<number> {
    const entries = await this.getEntriesInRange(start, end, userId)
    return entries.reduce((sum, e) => sum + e.billableHours, 0)
  }

  async create(entry: Omit<TimeEntry, 'id'>): Promise<number> {
    return await db.timeEntries.add(entry as TimeEntry)
  }

  async update(id: number, updates: Partial<TimeEntry>): Promise<number> {
    return await db.timeEntries.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async delete(id: number): Promise<void> {
    await db.timeEntries.delete(id)
  }

  async getById(id: number): Promise<TimeEntry | undefined> {
    return await db.timeEntries.get(id)
  }

  async getAll(userId: string = DEFAULT_USER_ID): Promise<TimeEntry[]> {
    return await db.timeEntries
      .where('userId').equals(userId)
      .reverse()
      .sortBy('createdAt')
  }
}

export const timeEntryRepository = new TimeEntryRepository()
