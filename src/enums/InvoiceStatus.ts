export const InvoiceStatus = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  SENT: 'sent',
  PAID: 'paid'
} as const

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus]
