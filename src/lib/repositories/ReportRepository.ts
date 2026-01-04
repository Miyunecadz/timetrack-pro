import { db, DEFAULT_USER_ID } from '../db'
import type { Report } from '../../types'
import { ReportType } from '../../enums'

export class ReportRepository {
  async getReportsByType(type: ReportType, userId: string = DEFAULT_USER_ID): Promise<Report[]> {
    return await db.reports
      .where({ userId, type })
      .reverse()
      .sortBy('createdAt')
  }

  async getReportByDate(type: ReportType, date: Date, userId: string = DEFAULT_USER_ID): Promise<Report | undefined> {
    return await db.reports
      .where({ userId, type })
      .and(r => r.date.toDateString() === date.toDateString())
      .first()
  }

  async create(report: Omit<Report, 'id'>): Promise<number> {
    return await db.reports.add(report as Report)
  }

  async update(id: number, updates: Partial<Report>): Promise<number> {
    return await db.reports.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async getById(id: number): Promise<Report | undefined> {
    return await db.reports.get(id)
  }

  async getAll(userId: string = DEFAULT_USER_ID): Promise<Report[]> {
    return await db.reports
      .where('userId').equals(userId)
      .reverse()
      .sortBy('createdAt')
  }
}

export const reportRepository = new ReportRepository()
