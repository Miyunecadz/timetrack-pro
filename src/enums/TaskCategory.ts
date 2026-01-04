export const TaskCategory = {
  DEVELOPMENT: 'Development',
  DEVOPS: 'DevOps / Deployment',
  BUG_FIX: 'Bug Fix',
  CODE_REVIEW: 'Code Review',
  MEETING: 'Meeting',
  DOCUMENTATION: 'Documentation',
  TESTING: 'Testing',
  RESEARCH: 'Research',
  AD_HOC: 'Ad-hoc / Unplanned',
  OTHER: 'Other'
} as const

export type TaskCategory = typeof TaskCategory[keyof typeof TaskCategory]
