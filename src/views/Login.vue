<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submitLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page" role="main" aria-label="登录页面">
    <!-- 动态背景装饰 -->
    <div class="bg-decoration" aria-hidden="true">
      <div class="floating-book book-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="floating-book book-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="floating-book book-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="floating-book book-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
    </div>

    <div class="login-wrapper">
      <el-card class="login-card" shadow="never" role="region" aria-label="登录表单">
        <div class="login-brand">
          <div class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-label="图书馆图标">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1>智慧图书馆管理系统</h1>
            <p>图书、读者与借阅的一体化管理</p>
          </div>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submitLogin">
          <el-form-item label="邮箱" prop="username">
            <el-input v-model="form.username" :prefix-icon="User" placeholder="请输入邮箱" autocomplete="username" size="large" aria-label="邮箱输入框" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" :prefix-icon="Lock" type="password" show-password placeholder="请输入密码" autocomplete="current-password" size="large" aria-label="密码输入框" />
          </el-form-item>
          <el-button type="primary" class="login-button" :loading="loading" size="large" @click="submitLogin" aria-label="点击登录">登录</el-button>
        </el-form>
        <p class="login-hint">测试账号：admin@demo.com / 123456　 user@demo.com / 123456</p>
      </el-card>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 动态背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-book {
  position: absolute;
  color: rgba(22, 93, 255, 0.05);
  animation: float 8s ease-in-out infinite;
}

.floating-book svg {
  width: 100%;
  height: 100%;
}

.book-1 {
  top: 15%;
  left: 10%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}

.book-2 {
  top: 60%;
  left: 15%;
  width: 60px;
  height: 60px;
  animation-delay: 2s;
}

.book-3 {
  top: 20%;
  right: 12%;
  width: 100px;
  height: 100px;
  animation-delay: 4s;
}

.book-4 {
  bottom: 15%;
  right: 10%;
  width: 70px;
  height: 70px;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.login-wrapper {
  position: relative;
  z-index: 1;
}

.login-card {
  width: 420px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.04),
    0 10px 24px -8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  background: linear-gradient(180deg, #ffffff 0%, #fdfdff 100%);
}

.login-brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 
    0 4px 12px rgba(22, 93, 255, 0.25),
    0 0 0 4px rgba(22, 93, 255, 0.08);
}

.brand-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.brand-text h1 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  letter-spacing: -0.01em;
}

.brand-text p {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

/* 输入框优化 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 14px;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
}

/* 按钮优化 */
.login-button {
  width: 100%;
  margin-top: 8px;
  border-radius: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.login-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #86909c;
}
</style>
