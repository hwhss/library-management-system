import { beforeEach, describe, expect, it } from 'vitest'
import { getBookList } from '../api/book.js'
import request from './request.js'

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
}

describe('local Axios adapter', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage()
  })

  it('returns book data through the public API module', async () => {
    const response = await getBookList()

    expect(response.code).toBe(200)
    expect(response.data.list.length).toBeGreaterThan(0)
    expect(response.data.total).toBe(100)
  })

  it('adds the stored token to outgoing request headers', async () => {
    localStorage.setItem('library_auth_token', 'test-token')
    const response = await request.get('/books')

    expect(response.config.headers.Authorization).toBe('Bearer test-token')
  })

  it('rejects unsupported local API paths with a useful error', async () => {
    await expect(request.get('/not-found')).rejects.toThrow('未找到 Mock 接口')
  })
})
