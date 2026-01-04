import React, { useState } from 'react'
import { useTaskStore } from '../../stores/useTaskStore'
import { TaskCategory, TaskStatus, Priority } from '../../enums'
import { Button, Input, Card } from '../ui'
import { Plus } from 'lucide-react'

export const TaskForm: React.FC = () => {
  const { createTask, isLoading } = useTaskStore()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.DEVELOPMENT)
  const [ticketNumber, setTicketNumber] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) return

    await createTask({
      description: description.trim(),
      enhancedDescription: description.trim(),
      category,
      ticketNumber: ticketNumber.trim() || null,
      status: TaskStatus.TODO,
      priority,
      plannedFor: new Date(),
      userId: 'default-user'
    } as any)

    // Reset form
    setDescription('')
    setTicketNumber('')
    setCategory(TaskCategory.DEVELOPMENT)
    setPriority(Priority.MEDIUM)
  }

  return (
    <Card title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Task Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(TaskCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Input
            label="Ticket Number (optional)"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g., PROJ-123"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading || !description.trim()}
        >
          <Plus className="inline-block mr-2" size={18} />
          Add Task
        </Button>
      </form>
    </Card>
  )
}
