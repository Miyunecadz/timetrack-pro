import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { formatCurrency } from './invoiceUtils'

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  periodStart: Date
  periodEnd: Date
  hours: number
  hourlyRate: number
  amount: number
  type: 'payout' | 'share'
}

export interface CompanyInfo {
  name: string
  address: string
  abn: string
}

export interface PersonalInfo {
  name: string
  address: string
}

export interface BankInfo {
  bankName: string
  bsb: string
  accountNumber: string
}

/**
 * Generate Payout Invoice PDF
 */
export function generatePayoutInvoicePDF(
  invoice: InvoiceData,
  company: CompanyInfo,
  personal: PersonalInfo,
  bank: BankInfo
): Blob {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 105, 20, { align: 'center' })

  // Invoice Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 35)
  doc.text(`Date: ${format(invoice.invoiceDate, 'dd/MM/yyyy')}`, 20, 42)

  // From Section
  doc.setFont('helvetica', 'bold')
  doc.text('From:', 20, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(personal.name, 20, 62)
  const addressLines = personal.address.split('\n')
  addressLines.forEach((line, index) => {
    doc.text(line, 20, 69 + (index * 7))
  })

  // To Section
  doc.setFont('helvetica', 'bold')
  doc.text('To:', 20, 95)
  doc.setFont('helvetica', 'normal')
  doc.text(company.name, 20, 102)
  doc.text(company.address, 20, 109)
  doc.text(`ABN: ${company.abn}`, 20, 116)

  // Period
  doc.setFont('helvetica', 'bold')
  doc.text('Period:', 20, 130)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${format(invoice.periodStart, 'dd/MM/yyyy')} - ${format(invoice.periodEnd, 'dd/MM/yyyy')}`,
    20,
    137
  )

  // Table Header
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 150, 170, 10, 'F')
  doc.text('Description', 25, 157)
  doc.text('Hours', 120, 157)
  doc.text('Rate', 145, 157)
  doc.text('Amount', 165, 157)

  // Table Row
  doc.setFont('helvetica', 'normal')
  doc.text('Contractor Project Hourly Rate', 25, 167)
  doc.text(invoice.hours.toFixed(1), 120, 167)
  doc.text(formatCurrency(invoice.hourlyRate), 145, 167)
  doc.text(formatCurrency(invoice.amount), 165, 167, { align: 'right' })

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 175, 170, 10, 'F')
  doc.text('Total:', 145, 182)
  doc.text(formatCurrency(invoice.amount), 185, 182, { align: 'right' })

  // Payment Details
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Details:', 20, 200)
  doc.setFont('helvetica', 'normal')
  doc.text(`Bank: ${bank.bankName}`, 20, 207)
  doc.text(`BSB: ${bank.bsb}`, 20, 214)
  doc.text(`Account: ${bank.accountNumber}`, 20, 221)

  // Payment Terms
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Terms:', 20, 240)
  doc.setFont('helvetica', 'normal')
  doc.text('Payment due within 30 days', 20, 247)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Thank you for your business', 105, 280, { align: 'center' })

  return doc.output('blob')
}

/**
 * Generate Share Option Purchase Notice PDF
 */
export function generateShareInvoicePDF(
  invoice: InvoiceData,
  company: CompanyInfo,
  personal: PersonalInfo
): Blob {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SHARE OPTION PURCHASE NOTICE', 105, 20, { align: 'center' })

  // Document Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Notice Number: ${invoice.invoiceNumber}`, 20, 35)
  doc.text(`Date: ${format(invoice.invoiceDate, 'dd/MM/yyyy')}`, 20, 42)

  // From Section
  doc.setFont('helvetica', 'bold')
  doc.text('From:', 20, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(personal.name, 20, 62)
  const addressLines = personal.address.split('\n')
  addressLines.forEach((line, index) => {
    doc.text(line, 20, 69 + (index * 7))
  })

  // To Section
  doc.setFont('helvetica', 'bold')
  doc.text('To:', 20, 95)
  doc.setFont('helvetica', 'normal')
  doc.text(company.name, 20, 102)
  doc.text(company.address, 20, 109)
  doc.text(`ABN: ${company.abn}`, 20, 116)

  // Period
  doc.setFont('helvetica', 'bold')
  doc.text('Period:', 20, 130)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${format(invoice.periodStart, 'dd/MM/yyyy')} - ${format(invoice.periodEnd, 'dd/MM/yyyy')}`,
    20,
    137
  )

  // Table Header
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 150, 170, 10, 'F')
  doc.text('Description', 25, 157)
  doc.text('Hours', 120, 157)
  doc.text('Rate', 145, 157)
  doc.text('Amount', 165, 157)

  // Table Row
  doc.setFont('helvetica', 'normal')
  doc.text('Contractor Project Hourly Rate (Extra Hours)', 25, 167)
  doc.text(invoice.hours.toFixed(1), 120, 167)
  doc.text(formatCurrency(invoice.hourlyRate), 145, 167)
  doc.text(formatCurrency(invoice.amount), 165, 167, { align: 'right' })

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 175, 170, 10, 'F')
  doc.text('Total Value:', 145, 182)
  doc.text(formatCurrency(invoice.amount), 185, 182, { align: 'right' })

  // Notice
  doc.setFont('helvetica', 'bold')
  doc.text('Notice:', 20, 200)
  doc.setFont('helvetica', 'normal')
  doc.text('These hours will be converted to company share options', 20, 207)
  doc.text('as per the agreed compensation structure.', 20, 214)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Share Option Purchase Notice', 105, 280, { align: 'center' })

  return doc.output('blob')
}

/**
 * Download PDF blob as file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
