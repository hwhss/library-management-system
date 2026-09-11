<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import {
  Odometer,
  Reading,
  User,
  Tickets,
  UserFilled,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapsed = ref(false)

const allMenuItems = [
  { path: '/dashboard', title: '仪表盘', icon: Odometer, roles: ['admin', 'user'] },
  { path: '/books', title: '图书管理', icon: Reading, roles: ['admin'] },
  { path: '/users', title: '读者管理', icon: User, roles: ['admin'] },
  { path: '/borrow', title: '借阅记录', icon: Tickets, roles: ['admin'] },
  { path: '/profile', title: '个人中心', icon: UserFilled, roles: ['admin', 'user'] }
]

const visibleMenuItems = computed(() => {
  const role = userStore.userInfo?.role
  return allMenuItems.filter(item => item.roles.includes(role))
})

async function resetDemoData() {
  try {
    await ElMessageBox.confirm(
      '确定要重置演示数据吗？所有修改将恢复到初始状态。',
      '重置确认',
      { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  localStorage.removeItem('library_mock_data')
  ElMessage.success('演示数据已重置，请刷新页面')
  setTimeout(() => {
    window.location.reload()
  }, 800)
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }" role="navigation" aria-label="主导航菜单">
    <div class="brand">
      <div class="brand__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-label="图书馆图标">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <transition name="fade">
        <span v-if="!isCollapsed" class="brand__name">智慧图书馆</span>
      </transition>
    </div>

    <nav class="sidebar-menu" aria-label="功能菜单">
      <router-link
        v-for="item in visibleMenuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ 'menu-item--active': route.path === item.path }"
        :aria-current="route.path === item.path ? 'page' : undefined"
      >
        <el-icon class="menu-item__icon" aria-hidden="true"><component :is="item.icon" /></el-icon>
        <transition name="fade">
          <span v-if="!isCollapsed" class="menu-item__text">{{ item.title }}</span>
        </transition>
      </router-link>
    </nav>

    <div class="sidebar__footer">
      <button class="footer-toggle" @click="isCollapsed = !isCollapsed" :aria-label="isCollapsed ? '展开菜单' : '收起菜单'" :aria-expanded="!isCollapsed">
        <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <transition name="fade">
          <span v-if="!isCollapsed" class="footer-toggle__text">收起菜单</span>
        </transition>
      </button>
      <button v-if="!isCollapsed" class="footer-reset" @click="resetDemoData" aria-label="重置演示数据">
        <el-icon aria-hidden="true"><Refresh /></el-icon>
        <span>重置演示数据</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #001529;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: 64px;
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand__icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand__icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.brand__name {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 40px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  margin: 0 8px;
  border-radius: 6px;
  position: relative;
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.menu-item--active {
  color: #fff;
  background: var(--primary-color);
}

.menu-item--active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #fff;
  border-radius: 0 3px 3px 0;
}

.menu-item__icon {
  font-size: 18px;
  flex-shrink: 0;
}

.menu-item__text {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar__footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 13px;
}

.footer-toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.footer-toggle svg {
  width: 16px;
  height: 16px;
}

.footer-reset {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  margin-top: 4px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 13px;
}

.footer-reset:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
