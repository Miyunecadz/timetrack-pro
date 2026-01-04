import { create } from 'zustand'
import type { Task } from '../types'
import { TaskCategory, TaskStatus, Priority } from '../enums'
import { taskRepository } from '../lib/repositories'
import { DEFAULT_USER_ID } from '../lib/db'

interface TaskState {
  // State
  tasks: Task[]
  filteredTasks: Task[]
  selectedTask: Task | null
  isLoading: boolean
  error: string | null

  // Filters
  statusFilter: TaskStatus | 'all'
  categoryFilter: TaskCategory | 'all'
  searchQuery: string

  // Actions
  loadTasks: () => Promise<void>
  loadTasksByDate: (date: Date) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number | undefined>
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  selectTask: (task: Task | null) => void
  setStatusFilter: (status: TaskStatus | 'all') => void
  setCategoryFilter: (category: TaskCategory | 'all') => void
  setSearchQuery: (query: string) => void
  applyFilters: () => void
  reset: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  statusFilter: 'all',
  categoryFilter: 'all',
  searchQuery: '',

  loadTasks: async () => {
    try {
      set({ isLoading: true, error: null })
      const tasks = await taskRepository.getAll()
      set({ tasks, filteredTasks: tasks, isLoading: false })
      get().applyFilters()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadTasksByDate: async (date: Date) => {
    try {
      set({ isLoading: true, error: null })
      const tasks = await taskRepository.getTasksByDate(date)
      set({ tasks, filteredTasks: tasks, isLoading: false })
      get().applyFilters()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null })

      const now = new Date()
      const task: Omit<Task, 'id'> = {
        userId: DEFAULT_USER_ID,
        description: taskData.description,
        enhancedDescription: taskData.enhancedDescription || taskData.description,
        category: taskData.category,
        ticketNumber: taskData.ticketNumber || null,
        status: taskData.status || TaskStatus.TODO,
        completionPercentage: 0,
        priority: taskData.priority || Priority.MEDIUM,
        isBlocker: false,
        blockerReason: '',
        timeEntryId: null,
        startTime: null,
        endTime: null,
        estimatedDuration: 0,
        actualDuration: 0,
        plannedFor: taskData.plannedFor || now,
        completedOn: null,
        dueDate: taskData.dueDate || null,
        carryOver: false,
        challengesEncountered: [],
        technicalDetails: '',
        notes: '',
        links: [],
        tags: [],
        project: '',
        feature: '',
        aiEnhanced: false,
        aiProvider: null,
        aiConfidence: 0,
        userApprovedAI: false,
        originalBeforeAI: '',
        postedToSlack: false,
        slackMessageId: null,
        slackChannel: null,
        slackTimestamp: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      }

      const id = await taskRepository.create(task)
      await get().loadTasks()
      set({ isLoading: false })
      return id
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      return undefined
    }
  },

  updateTask: async (id: number, updates: Partial<Task>) => {
    try {
      set({ isLoading: true, error: null })
      await taskRepository.update(id, updates)
      await get().loadTasks()
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteTask: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      await taskRepository.delete(id)
      await get().loadTasks()
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  selectTask: (task) => {
    set({ selectedTask: task })
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status })
    get().applyFilters()
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category })
    get().applyFilters()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  applyFilters: () => {
    const { tasks, statusFilter, categoryFilter, searchQuery } = get()

    let filtered = tasks

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(query) ||
        task.enhancedDescription.toLowerCase().includes(query) ||
        task.ticketNumber?.toLowerCase().includes(query)
      )
    }

    set({ filteredTasks: filtered })
  },

  reset: () => {
    set({
      tasks: [],
      filteredTasks: [],
      selectedTask: null,
      isLoading: false,
      error: null,
      statusFilter: 'all',
      categoryFilter: 'all',
      searchQuery: ''
    })
  }
}))
