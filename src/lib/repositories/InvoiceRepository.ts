import { db, DEFAULT_USER_ID } from '../db'
import type { InvoicePair } from '../../types'

export class InvoiceRepository {
  async getInvoiceHistory(userId: string = DEFAULT_USER_ID): Promise<InvoicePair[]> {
    return await db.invoicePairs
      .where('userId').equals(userId)
      .reverse()
      .sortBy('invoiceDate')
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoicePair | undefined> {
    return await db.invoicePairs
      .where('invoiceNumber').equals(invoiceNumber)
      .first()
  }

  async getLastInvoiceNumber(userId: string = DEFAULT_USER_ID): Promise<string | null> {
    const latest = await db.invoicePairs
      .where('userId').equals(userId)
      .reverse()
      .sortBy('invoiceNumber')

    return latest.length > 0 ? latest[0].invoiceNumber : null
  }

  async create(invoice: Omit<InvoicePair, 'id'>): Promise<number> {
    return await db.invoicePairs.add(invoice as InvoicePair)
  }

  async update(id: number, updates: Partial<InvoicePair>): Promise<number> {
    return await db.invoicePairs.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async getById(id: number): Promise<InvoicePair | undefined> {
    return await db.invoicePairs.get(id)
  }
}

export const invoiceRepository = new InvoiceRepository()
