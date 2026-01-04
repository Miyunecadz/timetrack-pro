import React, { useEffect } from 'react'
import { useTimeTrackingStore } from '../../stores/useTimeTrackingStore'
import { Card, Button } from '../ui'
import { RunningTimer } from './RunningTimer'
import { BreakManager } from './BreakManager'
import { Clock, StopCircle } from 'lucide-react'

export const TimeTracker: React.FC = () => {
  const {
    activeSession,
    isLoading,
    error,
    clockIn,
    clockOut,
    loadActiveSession
  } = useTimeTrackingStore()

  useEffect(() => {
    loadActiveSession()
  }, [loadActiveSession])

  const handleClockIn = async () => {
    await clockIn()
  }

  const handleClockOut = async () => {
    if (confirm('Are you sure you want to clock out?')) {
      await clockOut()
    }
  }

  return (
    <Card title="Time Tracking">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {activeSession ? (
          <div className="space-y-4">
            {/* Running Timer */}
            <RunningTimer session={activeSession} />

            {/* Break Manager */}
            <BreakManager session={activeSession} />

            {/* Clock Out Button */}
            <div className="pt-4">
              <Button
                variant="danger"
                size="lg"
                onClick={handleClockOut}
                disabled={isLoading}
                className="w-full"
              >
                <StopCircle className="inline-block mr-2" size={20} />
                Clock Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-6">You're not clocked in</p>
            <Button
              variant="success"
              size="lg"
              onClick={handleClockIn}
              disabled={isLoading}
            >
              <Clock className="inline-block mr-2" size={20} />
              Clock In
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
