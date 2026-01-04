export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked'
} as const

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]
