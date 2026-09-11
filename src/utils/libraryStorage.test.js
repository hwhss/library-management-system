import { beforeEach, describe, expect, it } from 'vitest'
import { getLibraryData, initializeLibraryData, resetLibraryData, saveLibraryData } from './libraryStorage.js'

class MemoryStorage {
  values = new Map()

  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
}

describe('libraryStorage', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage()
  })

  it('initializes the required seed data once', () => {
    const data = initializeLibraryData()

    expect(data.books).toHaveLength(100)
    expect(JSON.parse(localStorage.getItem('library_mock_data')).users).toHaveLength(30)
  })

  it('persists saved data and returns a defensive copy', () => {
    initializeLibraryData()
    const data = getLibraryData()
    data.books[0].stock = 99
    saveLibraryData(data)
    data.books[0].stock = 0

    expect(getLibraryData().books[0].stock).toBe(99)
  })

  it('restores seed data when reset is requested', () => {
    initializeLibraryData()
    const changedData = getLibraryData()
    changedData.books.pop()
    saveLibraryData(changedData)

    const resetData = resetLibraryData()

    expect(resetData.books).toHaveLength(100)
    expect(getLibraryData().books).toHaveLength(100)
  })
})
