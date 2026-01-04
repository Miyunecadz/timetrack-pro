import { useState } from 'react'
import { TimeTracker } from './components/time-tracking'
import { TaskForm, TaskList, TaskFilters } from './components/task-tracking'
import { ReportGenerator } from './components/reporting'
import { InvoiceGenerator } from './components/invoices'
import { FileText, Clock, DollarSign } from 'lucide-react'

type Tab = 'tracking' | 'reports' | 'invoices'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tracking')

  const tabs = [
    { id: 'tracking' as Tab, label: 'Time & Tasks', icon: Clock },
    { id: 'reports' as Tab, label: 'Reports', icon: FileText },
    { id: 'invoices' as Tab, label: 'Invoices (coming soon)', icon: DollarSign }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">TimeTrack Pro</h1>
          <p className="text-sm text-gray-600">Time Tracking & Task Reporting Application</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time Tracking */}
            <div className="lg:col-span-1 space-y-6">
              <TimeTracker />
            </div>

            {/* Task Tracking */}
            <div className="lg:col-span-2 space-y-6">
              <TaskForm />
              <TaskFilters />
              <TaskList />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto">
            <ReportGenerator />
          </div>
        )}

        {/* {activeTab === 'invoices' && (
          <div className="max-w-4xl mx-auto">
            <InvoiceGenerator />
          </div>
        )} */}

        {/* Status Section */}
        {/* <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phase 1 Progress</h2>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <li className="flex items-center text-green-600">
                <span className="mr-2">✅</span> Time Tracking
              </li>
              <li className="flex items-center text-green-600">
                <span className="mr-2">✅</span> Task Management
              </li>
              <li className="flex items-center text-green-600">
                <span className="mr-2">✅</span> Reporting System
              </li>
              <li className="flex items-center text-green-600">
                <span className="mr-2">✅</span> Invoice Generation
              </li>
            </ul>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-green-600">🎉 Phase 1 MVP Complete!</p>
              <p className="text-xs text-gray-500 mt-1">All core features implemented and working</p>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  )
}

export default App
