import { InvoiceStatus } from '../enums'

export interface InvoicePair {
  id?: number
  userId: string
  invoiceNumber: string
  periodStart: Date
  periodEnd: Date
  invoiceDate: Date
  totalHoursTracked: number
  payoutHours: number
  shareHours: number
  hourlyRate: number
  payoutAmount: number
  shareAmount: number
  totalAmount: number
  allocationMode: 'standard' | 'custom'
  isCustomSplit: boolean
  approvalNotes: string
  payoutInvoicePDF: Blob | null
  shareInvoicePDF: Blob | null
  payoutFileName: string
  shareFileName: string
  status: InvoiceStatus
  createdAt: Date
  updatedAt: Date
  sentAt: Date | null
  paidAt: Date | null
}
