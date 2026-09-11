<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user.js'
import request from '../utils/request.js'

const userStore = useUserStore()

// 个人信息
const profile = ref({})

// 修改密码表单
const dialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 加载个人信息
async function loadProfile() {
  // 直接从userStore获取当前用户信息
  profile.value = { ...userStore.userInfo }
}

// 打开修改密码弹窗
function openPasswordDialog() {
  dialogVisible.value = true
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 修改密码
async function handleChangePassword() {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    // 校验原密码是否正确
    if (passwordForm.oldPassword !== userStore.userInfo.password) {
      ElMessage.error('原密码不正确')
      return
    }

    // 调用接口更新用户密码
    const userId = userStore.userInfo.id
    await request.put(`/users/${userId}`, {
      ...userStore.userInfo,
      password: passwordForm.newPassword
    })

    // 更新store中的密码
    userStore.userInfo.password = passwordForm.newPassword
    userStore.saveUserInfo()

    ElMessage.success('密码修改成功')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="profile-page">
    <!-- 个人信息卡片 -->
    <el-card shadow="never" class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <div class="profile-header">
        <el-avatar :size="72" class="profile-avatar">{{ profile.username?.slice(0, 1).toUpperCase() }}</el-avatar>
        <div class="profile-meta">
          <h2 class="profile-name">{{ profile.name || profile.username }}</h2>
          <el-tag v-if="profile.role === 'admin'" type="danger" size="small">管理员</el-tag>
          <el-tag v-else type="primary" size="small">普通用户</el-tag>
        </div>
      </div>

      <el-descriptions :column="1" border class="profile-descriptions">
        <el-descriptions-item label="用户名">
          {{ profile.username || profile.name }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ profile.name }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ profile.phone || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="profile-actions">
        <el-button type="primary" @click="openPasswordDialog">修改密码</el-button>
      </div>
    </el-card>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改密码"
      width="450px"
      destroy-on-close
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 640px;
}
.profile-card {
  border: none;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}
.profile-avatar {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  font-size: 24px;
  font-weight: 600;
}
.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--foreground);
}
.profile-descriptions {
  margin-bottom: 24px;
}
.profile-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}
</style>
