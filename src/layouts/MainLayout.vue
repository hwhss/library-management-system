<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import Sidebar from '../components/Sidebar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => {
  const titleMap = {
    '/dashboard': '仪表盘',
    '/books': '图书管理',
    '/readers': '读者管理',
    '/borrow': '借阅记录',
    '/profile': '个人中心'
  }
  return titleMap[route.path] || '智慧图书馆'
})

async function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="main-layout">
    <Sidebar />
    <section class="main-layout__body" role="main">
      <header class="topbar" role="banner">
        <div class="breadcrumb-wrapper">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <el-dropdown trigger="click">
          <button class="user-menu" type="button" aria-label="用户菜单，点击展开" aria-haspopup="true">
            <div class="user-avatar" aria-hidden="true">
              {{ userStore.userInfo?.username?.slice(0, 1).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ userStore.userInfo?.username }}</span>
              <span class="user-role">{{ userStore.userInfo?.role === 'admin' ? '管理员' : '普通用户' }}</span>
            </div>
            <el-icon class="dropdown-icon" aria-hidden="true"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu aria-label="用户操作菜单">
              <el-dropdown-item :icon="SwitchButton" @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </section>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-layout__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-menu:hover {
  background: var(--border-light);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 12px;
  color: var(--text-tertiary);
}

.dropdown-icon {
  font-size: 14px;
  color: var(--text-tertiary);
}

.content-area {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  position: relative;
}

/* 顶部彩色装饰条 */
.content-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #165dff, #00b42a, #ff7d00, #f53f3f);
  opacity: 0.5;
}
</style>
