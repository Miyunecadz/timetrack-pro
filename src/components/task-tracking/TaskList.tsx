import React, { useEffect } from 'react'
import { useTaskStore } from '../../stores/useTaskStore'
import { TaskCard } from './TaskCard'
import { Card } from '../ui'
import { ClipboardList } from 'lucide-react'

export const TaskList: React.FC = () => {
  const { filteredTasks, loadTasks, isLoading, error } = useTaskStore()

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (isLoading && filteredTasks.length === 0) {
    return (
      <Card title="Tasks">
        <div className="text-center py-8 text-gray-500">
          Loading tasks...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="Tasks">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={`Tasks (${filteredTasks.length})`}>
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-2">No tasks found</p>
          <p className="text-sm text-gray-500">
            Add your first task using the form above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Card>
  )
}
