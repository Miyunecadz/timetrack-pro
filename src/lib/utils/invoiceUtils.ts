import { format } from 'date-fns'
import type { InvoicePair } from '../../types'
import { InvoiceStatus } from '../../enums'

export interface InvoiceCalculation {
  totalHoursTracked: number
  payoutHours: number
  shareHours: number
  hourlyRate: number
  payoutAmount: number
  shareAmount: number
  totalAmount: number
}

/**
 * Calculate invoice amounts based on total hours and allocation mode
 */
export function calculateInvoiceAmounts(
  totalHours: number,
  hourlyRate: number,
  allocationMode: 'standard' | 'custom',
  customPayoutHours?: number
): InvoiceCalculation {
  let payoutHours: number
  let shareHours: number

  if (allocationMode === 'standard') {
    // Standard mode: 80 hours to payout, remainder to shares
    if (totalHours <= 80) {
      payoutHours = totalHours
      shareHours = 0
    } else {
      payoutHours = 80
      shareHours = totalHours - 80
    }
  } else {
    // Custom mode: user-specified split
    payoutHours = customPayoutHours || 0
    shareHours = totalHours - payoutHours
  }

  const payoutAmount = payoutHours * hourlyRate
  const shareAmount = shareHours * hourlyRate
  const totalAmount = payoutAmount + shareAmount

  return {
    totalHoursTracked: totalHours,
    payoutHours,
    shareHours,
    hourlyRate,
    payoutAmount,
    shareAmount,
    totalAmount
  }
}

/**
 * Generate next invoice number
 */
export function generateInvoiceNumber(lastInvoiceNumber: string | null): string {
  if (!lastInvoiceNumber) {
    return '2000001' // Start from this number
  }

  const num = parseInt(lastInvoiceNumber, 10)
  return (num + 1).toString()
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Validate invoice data
 */
export function validateInvoiceData(
  totalHours: number,
  payoutHours: number,
  shareHours: number
): string[] {
  const errors: string[] = []

  if (totalHours <= 0) {
    errors.push('Total hours must be greater than 0')
  }

  if (payoutHours < 0) {
    errors.push('Payout hours cannot be negative')
  }

  if (shareHours < 0) {
    errors.push('Share hours cannot be negative')
  }

  if (payoutHours + shareHours !== totalHours) {
    errors.push('Payout hours + Share hours must equal total hours')
  }

  return errors
}

/**
 * Create invoice pair object
 */
export function createInvoicePair(
  calculation: InvoiceCalculation,
  invoiceNumber: string,
  periodStart: Date,
  periodEnd: Date,
  allocationMode: 'standard' | 'custom',
  userId: string
): Omit<InvoicePair, 'id'> {
  const now = new Date()

  return {
    userId,
    invoiceNumber,
    periodStart,
    periodEnd,
    invoiceDate: now,
    totalHoursTracked: calculation.totalHoursTracked,
    payoutHours: calculation.payoutHours,
    shareHours: calculation.shareHours,
    hourlyRate: calculation.hourlyRate,
    payoutAmount: calculation.payoutAmount,
    shareAmount: calculation.shareAmount,
    totalAmount: calculation.totalAmount,
    allocationMode,
    isCustomSplit: allocationMode === 'custom',
    approvalNotes: '',
    payoutInvoicePDF: null,
    shareInvoicePDF: null,
    payoutFileName: `invoice_${format(now, 'yyyy_MM_dd')}.pdf`,
    shareFileName: `share-option-purchase-notice-${format(now, 'yyyy_MM_dd')}.pdf`,
    status: InvoiceStatus.DRAFT,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    paidAt: null
  }
}
