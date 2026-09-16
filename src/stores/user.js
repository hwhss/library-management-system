import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.userInfo)
  },

  actions: {
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      if (error) {
        return { success: false, message: error.message }
      }
      // 查角色
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', data.user.id)
        .single()

      this.userInfo = {
        uid: data.user.id,
        username: profile?.username || email,
        role: profile?.role || 'user'
      }
      return { success: true }
    },

    async restoreSession() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        this.userInfo = null
        return false
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', data.session.user.id)
        .single()

      this.userInfo = {
        uid: data.session.user.id,
        username: profile?.username || data.session.user.email,
        role: profile?.role || 'user'
      }
      return true
    },

    async logout() {
      await supabase.auth.signOut()
      this.userInfo = null
    }
  }
})
