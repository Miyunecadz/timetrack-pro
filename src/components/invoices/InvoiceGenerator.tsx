import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../ui'
import { useTimeTrackingStore } from '../../stores/useTimeTrackingStore'
import { invoiceRepository, settingsRepository } from '../../lib/repositories'
import { DEFAULT_USER_ID } from '../../lib/db'
import {
  calculateInvoiceAmounts,
  generateInvoiceNumber,
  validateInvoiceData,
  createInvoicePair,
  formatCurrency,
  type InvoiceCalculation
} from '../../lib/utils/invoiceUtils'
import {
  generatePayoutInvoicePDF,
  generateShareInvoicePDF,
  downloadPDF,
  type CompanyInfo,
  type PersonalInfo,
  type BankInfo
} from '../../lib/utils/pdfGenerator'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Calculator, Download } from 'lucide-react'

export const InvoiceGenerator: React.FC = () => {
  const { timeEntries, loadTimeEntries } = useTimeTrackingStore()

  // Form state
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [allocationMode, setAllocationMode] = useState<'standard' | 'custom'>('standard')
  const [customPayoutHours, setCustomPayoutHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('406.25')

  // Calculation state
  const [calculation, setCalculation] = useState<InvoiceCalculation | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadTimeEntries()
    loadSettings()
  }, [])

  useEffect(() => {
    calculateInvoice()
  }, [periodStart, periodEnd, allocationMode, customPayoutHours, hourlyRate, timeEntries])

  const loadSettings = async () => {
    const invoiceSettings = await settingsRepository.getSetting('invoice_settings')
    if (invoiceSettings) {
      setHourlyRate(invoiceSettings.hourlyRate.toString())
    }
  }

  const calculateInvoice = () => {
    const start = new Date(periodStart)
    const end = new Date(periodEnd)

    const relevantEntries = timeEntries.filter(
      entry => entry.date >= start && entry.date <= end
    )

    const totalHours = relevantEntries.reduce((sum, entry) => sum + entry.billableHours, 0)
    const rate = parseFloat(hourlyRate) || 406.25
    const customHours = parseFloat(customPayoutHours) || undefined

    const calc = calculateInvoiceAmounts(totalHours, rate, allocationMode, customHours)

    const validationErrors = validateInvoiceData(
      calc.totalHoursTracked,
      calc.payoutHours,
      calc.shareHours
    )

    setErrors(validationErrors)
    setCalculation(calc)
  }

  const handleGenerateInvoices = async () => {
    if (!calculation || errors.length > 0) return

    setIsGenerating(true)
    try {
      // Get settings
      const invoiceSettings = await settingsRepository.getSetting('invoice_settings')
      const userProfile = await settingsRepository.getSetting('user_profile')

      const company: CompanyInfo = {
        name: invoiceSettings?.companyName || 'LeadAI PTY LTD',
        address: invoiceSettings?.companyAddress || 'Australia',
        abn: invoiceSettings?.companyABN || ''
      }

      const personal: PersonalInfo = {
        name: invoiceSettings?.personalName || userProfile?.name || 'June Vic Cadayona',
        address: invoiceSettings?.personalAddress || 'Cebu City, Philippines'
      }

      const bank: BankInfo = {
        bankName: invoiceSettings?.bankName || '',
        bsb: invoiceSettings?.bankBSB || '',
        accountNumber: invoiceSettings?.bankAccount || ''
      }

      // Generate invoice number
      const lastInvoiceNumber = await invoiceRepository.getLastInvoiceNumber()
      const invoiceNumber = generateInvoiceNumber(lastInvoiceNumber)

      const start = new Date(periodStart)
      const end = new Date(periodEnd)
      const now = new Date()

      // Generate Payout PDF
      if (calculation.payoutHours > 0) {
        const payoutPDF = generatePayoutInvoicePDF(
          {
            invoiceNumber,
            invoiceDate: now,
            periodStart: start,
            periodEnd: end,
            hours: calculation.payoutHours,
            hourlyRate: calculation.hourlyRate,
            amount: calculation.payoutAmount,
            type: 'payout'
          },
          company,
          personal,
          bank
        )
        downloadPDF(payoutPDF, `invoice_${format(now, 'yyyy_MM_dd')}.pdf`)
      }

      // Generate Share PDF
      if (calculation.shareHours > 0) {
        const sharePDF = generateShareInvoicePDF(
          {
            invoiceNumber,
            invoiceDate: now,
            periodStart: start,
            periodEnd: end,
            hours: calculation.shareHours,
            hourlyRate: calculation.hourlyRate,
            amount: calculation.shareAmount,
            type: 'share'
          },
          company,
          personal
        )
        downloadPDF(sharePDF, `share-option-purchase-notice-${format(now, 'yyyy_MM_dd')}.pdf`)
      }

      // Save invoice to database
      const invoicePair = createInvoicePair(
        calculation,
        invoiceNumber,
        start,
        end,
        allocationMode,
        DEFAULT_USER_ID
      )
      await invoiceRepository.create(invoicePair)

      alert('Invoices generated successfully!')
    } catch (error) {
      console.error('Error generating invoices:', error)
      alert('Error generating invoices. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card title="Generate Invoice">
      <div className="space-y-6">
        {/* Period Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Period Start"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
          <Input
            type="date"
            label="Period End"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
        </div>

        {/* Hourly Rate */}
        <Input
          type="number"
          step="0.01"
          label="Hourly Rate ($)"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />

        {/* Allocation Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hour Allocation
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="standard"
                checked={allocationMode === 'standard'}
                onChange={() => setAllocationMode('standard')}
                className="mr-2"
              />
              <span className="text-sm">Standard (80 hours to payout, remainder to shares)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={allocationMode === 'custom'}
                onChange={() => setAllocationMode('custom')}
                className="mr-2"
              />
              <span className="text-sm">Custom allocation</span>
            </label>
          </div>
        </div>

        {/* Custom Payout Hours */}
        {allocationMode === 'custom' && (
          <Input
            type="number"
            step="0.1"
            label="Payout Hours"
            value={customPayoutHours}
            onChange={(e) => setCustomPayoutHours(e.target.value)}
            placeholder="Enter payout hours"
          />
        )}

        {/* Calculation Preview */}
        {calculation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <Calculator className="text-blue-600 mr-2 mt-0.5" size={20} />
              <h3 className="font-semibold text-blue-900">Invoice Calculation</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Hours Tracked:</span>
                <span className="font-medium">{calculation.totalHoursTracked.toFixed(1)} hours</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Payout Hours:</span>
                  <span className="font-medium">{calculation.payoutHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Amount:</span>
                  <span>{formatCurrency(calculation.payoutAmount)}</span>
                </div>
              </div>
              <div className="border-t border-blue-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Share Option Hours:</span>
                  <span className="font-medium">{calculation.shareHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Value:</span>
                  <span>{formatCurrency(calculation.shareAmount)}</span>
                </div>
              </div>
              <div className="border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-blue-900">
                  <span>Total Value:</span>
                  <span>{formatCurrency(calculation.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-2">Cannot generate invoice:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Generate Button */}
        <Button
          variant="success"
          size="lg"
          onClick={handleGenerateInvoices}
          disabled={!calculation || errors.length > 0 || isGenerating || calculation.totalHoursTracked === 0}
          className="w-full"
        >
          <Download className="inline-block mr-2" size={20} />
          {isGenerating ? 'Generating...' : 'Generate & Download PDFs'}
        </Button>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> This will generate two PDFs - one for payout invoice and one for share option purchase notice (if applicable)
          </p>
        </div>
      </div>
    </Card>
  )
}
