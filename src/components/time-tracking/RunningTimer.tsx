import React, { useEffect, useState } from 'react'
import type { TimeEntry } from '../../types'
import { calculateDuration, formatTime, formatDuration } from '../../lib/utils/timeUtils'

interface RunningTimerProps {
  session: TimeEntry
}

export const RunningTimer: React.FC<RunningTimerProps> = ({ session }) => {
  const [currentDuration, setCurrentDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const duration = calculateDuration(session.clockInTime, new Date())
      setCurrentDuration(duration)
    }, 1000)

    return () => clearInterval(interval)
  }, [session.clockInTime])

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="text-center">
        <p className="text-sm text-green-700 mb-2">Currently Clocked In</p>
        <p className="text-3xl font-bold text-green-900 mb-2">
          {formatDuration(currentDuration)}
        </p>
        <p className="text-sm text-green-600">
          Started at {formatTime(session.clockInTime)}
        </p>
      </div>
    </div>
  )
}
