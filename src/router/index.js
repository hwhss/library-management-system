import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user.js'
import { getRouteAccessDecision } from './permission.js'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue'), meta: { guestOnly: true, title: '登录' } },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true, roles: ['admin', 'user'], title: '仪表盘' } },
      { path: 'books', component: () => import('../views/books/BookList.vue'), meta: { requiresAuth: true, roles: ['admin'], title: '图书管理' } },
      { path: 'users', component: () => import('../views/users/UserList.vue'), meta: { requiresAuth: true, roles: ['admin'], title: '读者管理' } },
      { path: 'borrow', component: () => import('../views/borrow/BorrowList.vue'), meta: { requiresAuth: true, roles: ['admin'], title: '借阅记录' } },
      { path: 'profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true, roles: ['admin', 'user'], title: '个人中心' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  if (!userStore.userInfo) await userStore.restoreSession()
  const decision = getRouteAccessDecision(to, userStore.userInfo)
  if (decision.message) ElMessage.warning(decision.message)
  return decision.allow ? true : decision.redirect
})

export default router
