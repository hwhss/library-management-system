import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './user.js'

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
}

describe('user store', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage()
    setActivePinia(createPinia())
  })

  it('logs in the administrator and persists the session', () => {
    const store = useUserStore()
    const result = store.login('admin', '123456')

    expect(result.success).toBe(true)
    expect(store.userInfo.role).toBe('admin')
    expect(store.isLoggedIn).toBe(true)
    expect(localStorage.getItem('library_auth_token')).toBeTruthy()
  })

  it('rejects invalid credentials without creating a session', () => {
    const store = useUserStore()
    const result = store.login('admin', 'wrong-password')

    expect(result).toEqual({ success: false, message: '用户名或密码错误' })
    expect(store.isLoggedIn).toBe(false)
  })

  it('restores a saved normal-user session and clears it on logout', () => {
    const firstStore = useUserStore()
    firstStore.login('user', '123456')

    setActivePinia(createPinia())
    const restoredStore = useUserStore()
    restoredStore.restoreSession()
    expect(restoredStore.userInfo.role).toBe('user')

    restoredStore.logout()
    expect(restoredStore.isLoggedIn).toBe(false)
    expect(localStorage.getItem('library_auth_token')).toBeNull()
  })
})
