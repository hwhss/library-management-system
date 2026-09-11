import { defineStore } from 'pinia'

const TOKEN_KEY = 'library_auth_token'
const USER_INFO_KEY = 'library_user_info'

const testAccounts = [
  { username: 'admin', password: '123456', role: 'admin', registerTime: '2026-01-01' },
  { username: 'user', password: '123456', role: 'user', registerTime: '2026-01-01' }
]

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.userInfo)
  },

  actions: {
    login(username, password) {
      const account = testAccounts.find((item) => item.username === username && item.password === password)

      if (!account) {
        return { success: false, message: '用户名或密码错误' }
      }

      this.token = `mock-${account.role}-token`
      this.userInfo = {
        username: account.username,
        role: account.role,
        registerTime: account.registerTime
      }
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(this.userInfo))
      return { success: true }
    },

    restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY)
      const savedUserInfo = localStorage.getItem(USER_INFO_KEY)

      if (!token || !savedUserInfo) {
        this.logout()
        return false
      }

      try {
        this.token = token
        this.userInfo = JSON.parse(savedUserInfo)
        return true
      } catch {
        this.logout()
        return false
      }
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
    }
  }
})
