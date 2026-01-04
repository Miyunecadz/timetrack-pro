import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../ui'
import { useTaskStore } from '../../stores/useTaskStore'
import { generateDailyReport, type DailyReportData, getCompletedTasksForDate, getTasksForReport } from '../../lib/utils/reportGenerators'
import { Copy, Check } from 'lucide-react'
import { format, addDays } from 'date-fns'

export const DailyReport: React.FC = () => {
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
    const date = new Date(selectedDate)
    const tomorrow = addDays(date, 1)

    const completedTasks = getCompletedTasksForDate(tasks, date)
    const tasksWithChallenges = completedTasks.filter(
      t => t.challengesEncountered && t.challengesEncountered.length > 0
    )

    const data: DailyReportData = {
      date,
      completedTasks,
      tasksWithChallenges,
      tomorrowTasks: getTasksForReport(tasks, tomorrow)
    }

    setReportText(generateDailyReport(data))
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title="End of Day Report">
      <div className="space-y-4">
        <div>
          <Input
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
              Copy to Clipboard
            </>
          )}
        </Button>

        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> This report will be posted to #day-reporting on Slack (Phase 3)
          </p>
        </div> */}
      </div>
    </Card>
  )
}
