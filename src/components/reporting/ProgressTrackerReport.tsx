import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../ui'
import { useTaskStore } from '../../stores/useTaskStore'
import { generateProgressTracker, type ProgressTrackerData, getCompletedTasksForDate, getTasksForReport } from '../../lib/utils/reportGenerators'
import { Copy, Check } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { TaskStatus } from '../../enums'

export const ProgressTrackerReport: React.FC = () => {
  const { tasks, loadTasks } = useTaskStore()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reportText, setReportText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    generateReport()
  }, [selectedDate, tasks])

  const generateReport = () => {
    const today = new Date(selectedDate)
    const yesterday = subDays(today, 1)

    const data: ProgressTrackerData = {
      previousDayTasks: getCompletedTasksForDate(tasks, yesterday),
      todayTasks: getTasksForReport(tasks, today),
      blockedTasks: tasks.filter(t => t.status === TaskStatus.BLOCKED && !t.deletedAt)
    }

    setReportText(generateProgressTracker(data))
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title="Progress Tracker (Daily Standup)">
      <div className="space-y-4">
        <div>
          <Input
            type="date"
            label="Select Date (Today)"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Shows previous day's completed tasks and today's planned tasks
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {reportText}
          </pre>
        </div>

        <Button
          variant="primary"
          onClick={copyToClipboard}
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="inline-block mr-2" size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy className="inline-block mr-2" size={18} />
              Copy to Clipboard (for Excel)
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
