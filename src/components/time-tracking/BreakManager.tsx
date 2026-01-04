import React from 'react'
import type { TimeEntry } from '../../types'
import { useTimeTrackingStore } from '../../stores/useTimeTrackingStore'
import { Button } from '../ui'
import { Coffee, Play } from 'lucide-react'
import { formatTime, calculateBreakDuration } from '../../lib/utils/timeUtils'

interface BreakManagerProps {
  session: TimeEntry
}

export const BreakManager: React.FC<BreakManagerProps> = ({ session }) => {
  const { startBreak, endBreakAction, isLoading } = useTimeTrackingStore()

  const activeBreak = session.breaks.find(brk => brk.endTime === null)
  const totalBreakMinutes = calculateBreakDuration(session.breaks)

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Breaks</h4>
        <span className="text-sm text-gray-600">
          Total: {Math.floor(totalBreakMinutes / 60)}h {totalBreakMinutes % 60}m
        </span>
      </div>

      {activeBreak ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Break in progress</p>
              <p className="text-xs text-yellow-700 mt-1">
                Started at {formatTime(activeBreak.startTime)}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={endBreakAction}
              disabled={isLoading}
            >
              <Play className="inline-block mr-1" size={16} />
              End Break
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={startBreak}
          disabled={isLoading}
          className="w-full"
        >
          <Coffee className="inline-block mr-2" size={18} />
          Start Break
        </Button>
      )}

      {session.breaks.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Break History:</p>
          <div className="space-y-1">
            {session.breaks.map((brk, index) => (
              <div key={brk.id} className="text-xs text-gray-600 flex justify-between">
                <span>Break {index + 1}</span>
                <span>
                  {formatTime(brk.startTime)}
                  {brk.endTime && ` - ${formatTime(brk.endTime)}`}
                  {brk.endTime && ` (${brk.duration}m)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
