import { startOfDay, endOfDay } from 'date-fns'
import { db, DEFAULT_USER_ID } from '../db'
import type { Task } from '../../types'
import { TaskStatus } from '../../enums'

export class TaskRepository {
  async getTasksByDate(date: Date, userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    const start = startOfDay(date)
    const end = endOfDay(date)

    return await db.tasks
      .where('userId').equals(userId)
      .and(t => t.plannedFor >= start && t.plannedFor <= end && !t.deletedAt)
      .toArray()
  }

  async getCompletedTasks(date: Date, userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    const start = startOfDay(date)
    const end = endOfDay(date)

    return await db.tasks
      .where('userId').equals(userId)
      .and(t => t.status === TaskStatus.COMPLETED && t.completedOn !== null && t.completedOn >= start && t.completedOn <= end && t.deletedAt === null)
      .toArray()
  }

  async getCompletedTasksInRange(start: Date, end: Date, userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    const startDay = startOfDay(start)
    const endDay = endOfDay(end)

    return await db.tasks
      .where('userId').equals(userId)
      .and(t => t.status === TaskStatus.COMPLETED && t.completedOn !== null && t.completedOn >= startDay && t.completedOn <= endDay && t.deletedAt === null)
      .toArray()
  }

  async getBlockedTasks(userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    return await db.tasks
      .where({ userId, status: TaskStatus.BLOCKED })
      .and(t => !t.deletedAt)
      .toArray()
  }

  async getTasksByStatus(status: TaskStatus, userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    return await db.tasks
      .where({ userId, status })
      .and(t => !t.deletedAt)
      .toArray()
  }

  async searchTasks(query: string, userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    const lowerQuery = query.toLowerCase()

    return await db.tasks
      .where('userId').equals(userId)
      .filter(t =>
        t.deletedAt === null && (
          t.description.toLowerCase().includes(lowerQuery) ||
          t.enhancedDescription.toLowerCase().includes(lowerQuery) ||
          (t.ticketNumber?.includes(query) ?? false)
        )
      )
      .toArray()
  }

  async create(task: Omit<Task, 'id'>): Promise<number> {
    return await db.tasks.add(task as Task)
  }

  async update(id: number, updates: Partial<Task>): Promise<number> {
    return await db.tasks.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async delete(id: number): Promise<number> {
    return await db.tasks.update(id, {
      deletedAt: new Date(),
      updatedAt: new Date()
    })
  }

  async getById(id: number): Promise<Task | undefined> {
    const task = await db.tasks.get(id)
    return task && !task.deletedAt ? task : undefined
  }

  async getAll(userId: string = DEFAULT_USER_ID): Promise<Task[]> {
    return await db.tasks
      .where('userId').equals(userId)
      .and(t => !t.deletedAt)
      .reverse()
      .sortBy('createdAt')
  }
}

export const taskRepository = new TaskRepository()
