import React from 'react'
import type { Task } from '../../types'
import { TaskStatus } from '../../enums'
import { useTaskStore } from '../../stores/useTaskStore'
import { Button } from '../ui'
import { CheckCircle, Circle, AlertCircle, Trash2 } from 'lucide-react'
import { formatDate } from '../../lib/utils/timeUtils'

interface TaskCardProps {
  task: Task
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTaskStore()

  const handleStatusChange = async (newStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: newStatus }

    if (newStatus === TaskStatus.COMPLETED && !task.completedOn) {
      updates.completedOn = new Date()
    }

    await updateTask(task.id!, updates)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id!)
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle className="text-green-600" size={20} />
      case TaskStatus.BLOCKED:
        return <AlertCircle className="text-red-600" size={20} />
      case TaskStatus.IN_PROGRESS:
        return <Circle className="text-blue-600 fill-blue-600" size={20} />
      default:
        return <Circle className="text-gray-400" size={20} />
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-50 border-green-200'
      case TaskStatus.BLOCKED:
        return 'bg-red-50 border-red-200'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getPriorityBadge = () => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[task.priority]}`}>
        {task.priority.toUpperCase()}
      </span>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-0.5">{getStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.description}
            </p>
            {task.ticketNumber && (
              <p className="text-xs text-gray-500 mt-1">
                Ticket: {task.ticketNumber}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {task.category}
          </span>
          {getPriorityBadge()}
        </div>

        <div className="flex space-x-1">
          {task.status !== TaskStatus.COMPLETED && (
            <>
              {task.status === TaskStatus.TODO && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                >
                  Start
                </Button>
              )}
              {task.status === TaskStatus.IN_PROGRESS && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                >
                  Complete
                </Button>
              )}
            </>
          )}
          {task.status === TaskStatus.COMPLETED && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange(TaskStatus.TODO)}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      {task.completedOn && (
        <p className="text-xs text-gray-500 mt-2">
          Completed on {formatDate(task.completedOn)}
        </p>
      )}
    </div>
  )
}
