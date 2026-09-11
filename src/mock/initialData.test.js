import { describe, expect, it } from 'vitest'
import { initialLibraryData } from './initialData.js'

describe('initialLibraryData', () => {
  it('provides the required amount of reference data', () => {
    expect(initialLibraryData.books).toHaveLength(100)
    expect(initialLibraryData.users).toHaveLength(30)
    expect(initialLibraryData.borrowRecords.length).toBeGreaterThanOrEqual(70)
  })

  it('uses unique ISBNs, student IDs, and phone numbers', () => {
    const isbns = initialLibraryData.books.map((book) => book.isbn)
    const studentIds = initialLibraryData.users.map((user) => user.studentId)
    const phones = initialLibraryData.users.map((user) => user.phone)

    expect(new Set(isbns).size).toBe(100)
    expect(new Set(studentIds).size).toBe(30)
    expect(new Set(phones).size).toBe(30)
  })

  it('includes every supported borrowing status', () => {
    const statuses = initialLibraryData.borrowRecords.map((record) => record.status)

    expect(statuses).toContain('borrowing')
    expect(statuses).toContain('overdue')
    expect(statuses).toContain('returned')
    expect(statuses).toContain('overdue_returned')
  })

  it('keeps every active borrowing record linked to real book and reader data', () => {
    const bookIds = new Set(initialLibraryData.books.map((book) => book.id))
    const readerIds = new Set(initialLibraryData.users.map((user) => user.id))
    const activeStatuses = new Set(['borrowing', 'overdue'])

    for (const record of initialLibraryData.borrowRecords) {
      expect(bookIds.has(record.bookId)).toBe(true)
      expect(readerIds.has(record.readerId)).toBe(true)
      if (activeStatuses.has(record.status)) {
        expect(record.returnDate).toBeNull()
      } else {
        expect(record.returnDate).toBeTruthy()
      }
    }
  })

  it('uses non-negative integer stock values', () => {
    for (const book of initialLibraryData.books) {
      expect(Number.isInteger(book.stock)).toBe(true)
      expect(book.stock).toBeGreaterThanOrEqual(0)
    }
  })
})
