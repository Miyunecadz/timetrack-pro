import { db, DEFAULT_USER_ID } from '../db'
import type { Settings } from '../../types'

export class SettingsRepository {
  async getSetting<T = any>(key: string, userId: string = DEFAULT_USER_ID): Promise<T | null> {
    const setting = await db.settings
      .where({ userId, key })
      .first()

    return setting ? setting.value : null
  }

  async setSetting<T = any>(key: string, value: T, userId: string = DEFAULT_USER_ID): Promise<number> {
    const existing = await db.settings.where({ userId, key }).first()

    if (existing) {
      return await db.settings.update(existing.id!, {
        value,
        updatedAt: new Date()
      })
    } else {
      return await db.settings.add({
        userId,
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  async deleteSetting(key: string, userId: string = DEFAULT_USER_ID): Promise<void> {
    const setting = await db.settings.where({ userId, key }).first()
    if (setting) {
      await db.settings.delete(setting.id!)
    }
  }

  async getAllSettings(userId: string = DEFAULT_USER_ID): Promise<Settings[]> {
    return await db.settings.where('userId').equals(userId).toArray()
  }
}

export const settingsRepository = new SettingsRepository()
