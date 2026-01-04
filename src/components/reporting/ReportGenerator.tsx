import React, { useState } from 'react'
import { Card } from '../ui'
import { ReportType } from '../../enums'
import { HoursReport } from './HoursReport'
import { ProgressTrackerReport } from './ProgressTrackerReport'
import { DailyReport } from './DailyReport'
import { WeeklyReport } from './WeeklyReport'
import { FileText } from 'lucide-react'

export const ReportGenerator: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReportType>(ReportType.HOURS)

  const reportTypes = [
    { value: ReportType.HOURS, label: 'Hours Completed', description: 'Daily time log' },
    { value: ReportType.PROGRESS_TRACKER, label: 'Progress Tracker', description: 'Daily standup' },
    { value: ReportType.DAILY, label: 'End of Day', description: 'Formal daily report' },
    { value: ReportType.WEEKLY, label: 'Weekly Report', description: 'Strategic summary' }
  ]

  const renderReport = () => {
    switch (selectedType) {
      case ReportType.HOURS:
        return <HoursReport />
      case ReportType.PROGRESS_TRACKER:
        return <ProgressTrackerReport />
      case ReportType.DAILY:
        return <DailyReport />
      case ReportType.WEEKLY:
        return <WeeklyReport />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Generate Reports">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <FileText
                      className={`mt-0.5 mr-3 ${
                        selectedType === type.value ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      size={20}
                    />
                    <div>
                      <p className={`font-medium ${
                        selectedType === type.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {renderReport()}
    </div>
  )
}
