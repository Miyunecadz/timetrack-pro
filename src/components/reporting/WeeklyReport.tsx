import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../ui'
import { useTaskStore } from '../../stores/useTaskStore'
import { generateWeeklyReport, type WeeklyReportData, getTasksForWeek, getCompletedTasksForWeek } from '../../lib/utils/reportGenerators'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { TaskStatus } from '../../enums'

export const WeeklyReport: React.FC = () => {
  const { tasks, loadTasks } = useTaskStore()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reportText, setReportText] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    generateReport()
  }, [selectedDate, tasks])

  const generateReport = () => {
    const date = new Date(selectedDate)
    const weekStart = startOfWeek(date)
    const weekEnd = endOfWeek(date)

    const weekTasks = getTasksForWeek(tasks, weekStart)
    const completedTasks = getCompletedTasksForWeek(tasks, weekStart)
    const inProgressTasks = weekTasks.filter(
      t => t.status === TaskStatus.IN_PROGRESS ||
           (t.status === TaskStatus.TODO && t.completionPercentage > 0)
    )

    // Validation: Minimum 5 tasks required
    if (weekTasks.length < 5) {
      setError(`Minimum 5 tasks required for weekly report. Currently: ${weekTasks.length} tasks`)
      setReportText('')
      return
    }

    setError('')

    const nextWeekStart = addWeeks(weekStart, 1)
    const nextWeekTasks = getTasksForWeek(tasks, nextWeekStart)

    const data: WeeklyReportData = {
      weekStart,
      weekEnd,
      plannedTasks: weekTasks,
      completedTasks,
      inProgressTasks,
      nextWeekTasks: nextWeekTasks.length > 0
        ? nextWeekTasks
        : inProgressTasks // Use in-progress as next week goals if no tasks planned
    }

    setReportText(generateWeeklyReport(data))
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const weekStart = startOfWeek(new Date(selectedDate))
  const weekEnd = endOfWeek(new Date(selectedDate))

  return (
    <Card title="Weekly Report">
      <div className="space-y-4">
        <div>
          <Input
            type="date"
            label="Select Any Day in Week"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Week: {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>

        {error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Cannot Generate Report</p>
                <p className="text-sm text-yellow-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                  Copy to Clipboard
                </>
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> This report will be posted to #week-reporting on Slack (Phase 3)
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
