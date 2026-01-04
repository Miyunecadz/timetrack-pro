import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../ui'
import { useTimeTrackingStore } from '../../stores/useTimeTrackingStore'
import { generateHoursReport, type HoursReportData } from '../../lib/utils/reportGenerators'
import { calculateTotalHours } from '../../lib/utils/timeUtils'
import { Copy, Check } from 'lucide-react'
import { format } from 'date-fns'

export const HoursReport: React.FC = () => {
  const { timeEntries, loadTimeEntries } = useTimeTrackingStore()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reportText, setReportText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadTimeEntries()
  }, [loadTimeEntries])

  useEffect(() => {
    generateReport()
  }, [selectedDate, timeEntries])

  const generateReport = () => {
    const date = new Date(selectedDate)
    const entriesForDate = timeEntries.filter(
      entry => format(entry.date, 'yyyy-MM-dd') === selectedDate
    )

    const data: HoursReportData = {
      date,
      entries: entriesForDate,
      totalHours: calculateTotalHours(entriesForDate)
    }

    setReportText(generateHoursReport(data))
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title="Hours Completed Report">
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
      </div>
    </Card>
  )
}
