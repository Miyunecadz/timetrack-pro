import Dexie from "dexie";
import type { Table } from "dexie";
import type {
  TimeEntry,
  Task,
  InvoicePair,
  Report,
  Settings,
  AIUsage,
} from "../types";

// Database class
export class TimeTrackDB extends Dexie {
  // Tables
  timeEntries!: Table<TimeEntry>;
  tasks!: Table<Task>;
  invoicePairs!: Table<InvoicePair>;
  reports!: Table<Report>;
  settings!: Table<Settings>;
  aiUsage!: Table<AIUsage>;

  constructor() {
    super("TimeTrackDB");

    this.version(1).stores({
      timeEntries: "++id, userId, date, status, createdAt",
      tasks:
        "++id, userId, status, plannedFor, completedOn, category, createdAt",
      invoicePairs:
        "++id, userId, invoiceNumber, periodStart, periodEnd, status",
      reports: "++id, userId, type, date, createdAt",
      settings: "++id, userId, key, [userId+key]",
      aiUsage: "++id, provider, timestamp, userId",
    });
  }
}

// Create and export database instance
export const db = new TimeTrackDB();

// Default user ID for single-user application
export const DEFAULT_USER_ID = "default-user";
