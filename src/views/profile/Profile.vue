<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Book, User, Reading, Clock, Settings, Collection, Star, History, Bell } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user.js'
import request from '../../utils/request.js'
import { getLibraryData } from '../../utils/libraryStorage.js'

const userStore = useUserStore()

// 通知设置
const notifySettings = reactive({
  due: true,
  overdue: true,
  newBook: false
})

// 个人信息
const profile = ref({})

// 统计数据
const stats = ref({
  bookCount: 0,
  readerCount: 0,
  borrowCount: 0,
  overdueCount: 0,
  totalBorrowed: 0,
  favoriteCount: 0
})

// 我的借阅记录
const myBorrows = ref([])

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

// 计算逾期天数
function getOverdueDays(record) {
  if (!record.dueDate || record.returnDate) return 0
  const due = new Date(record.dueDate)
  const now = new Date('2026-09-11') // 当前日期
  const diff = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// 获取状态样式
function getStatusClass(status) {
  const map = {
    borrowing: 'status--borrowing',
    overdue: 'status--overdue',
    returned: 'status--returned',
    overdue_returned: 'status--overdue_returned'
  }
  return map[status] || ''
}

function getStatusText(status) {
  const map = {
    borrowing: '借阅中',
    overdue: '已逾期',
    returned: '已归还',
    overdue_returned: '逾期归还'
  }
  return map[status] || status
}

// 加载个人信息和统计
async function loadProfile() {
  profile.value = { ...userStore.userInfo }
  
  // 加载统计数据
  const data = getLibraryData()
  stats.value.bookCount = data.books.length
  stats.value.readerCount = data.readers.length
  
  // 统计当前用户的借阅记录
  const userId = userStore.userInfo.id
  const userBorrows = data.borrowRecords.filter(b => b.readerId === userId)
  myBorrows.value = userBorrows.slice(0, 10) // 取最近10条
  
  stats.value.borrowCount = userBorrows.filter(b => !b.returnDate && b.status !== 'returned').length
  stats.value.overdueCount = userBorrows.filter(b => b.status === 'overdue').length
  stats.value.totalBorrowed = userBorrows.length
  stats.value.favoriteCount = Math.floor(Math.random() * 20) + 5 // Mock收藏数
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
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <div class="stat-card stat-card--blue">
          <div class="stat-card__icon">
            <el-icon><Book /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.bookCount }}</div>
            <div class="stat-card__label">图书总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card stat-card--green">
          <div class="stat-card__icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.readerCount }}</div>
            <div class="stat-card__label">读者总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card stat-card--orange">
          <div class="stat-card__icon">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.borrowCount }}</div>
            <div class="stat-card__label">当前借阅</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card stat-card--red">
          <div class="stat-card__icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.overdueCount }}</div>
            <div class="stat-card__label">逾期数量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card stat-card--purple">
          <div class="stat-card__icon">
            <el-icon><History /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.totalBorrowed }}</div>
            <div class="stat-card__label">累计借阅</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card stat-card--pink">
          <div class="stat-card__icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.favoriteCount }}</div>
            <div class="stat-card__label">我的收藏</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="10">
        <el-card shadow="never" class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" size="small" @click="openPasswordDialog">
                <el-icon><Settings /></el-icon>
                <span style="margin-left: 4px">修改密码</span>
              </el-button>
            </div>
          </template>

          <div class="profile-content">
            <div class="profile-avatar">
              <div class="avatar-circle">
                {{ profile.username?.slice(0, 1).toUpperCase() }}
              </div>
              <h3 class="profile-name">{{ profile.username || profile.name }}</h3>
              <el-tag :type="profile.role === 'admin' ? 'danger' : 'primary'" size="small">
                {{ profile.role === 'admin' ? '系统管理员' : '普通读者' }}
              </el-tag>
            </div>

            <el-descriptions :column="1" border class="profile-descriptions">
              <el-descriptions-item label="用户名">
                {{ profile.username || profile.name }}
              </el-descriptions-item>
              <el-descriptions-item label="姓名">
                {{ profile.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="学号">
                {{ profile.studentId || '2023001' }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ profile.gender || '男' }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                {{ profile.role === 'admin' ? '系统管理员' : '普通读者' }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ profile.phone || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ profile.registerTime || '2026-01-01' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 通知设置卡片 -->
        <el-card shadow="never" class="notify-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Bell /></el-icon> 通知设置</span>
            </div>
          </template>
          <div class="notify-list">
            <div class="notify-item">
              <div class="notify-info">
                <span class="notify-title">到期提醒</span>
                <span class="notify-desc">图书到期前3天发送提醒</span>
              </div>
              <el-switch v-model="notifySettings.due" active-color="#6366f1" />
            </div>
            <div class="notify-item">
              <div class="notify-info">
                <span class="notify-title">逾期提醒</span>
                <span class="notify-desc">图书逾期时立即发送提醒</span>
              </div>
              <el-switch v-model="notifySettings.overdue" active-color="#6366f1" />
            </div>
            <div class="notify-item">
              <div class="notify-info">
                <span class="notify-title">新书通知</span>
                <span class="notify-desc">有新书入库时通知我</span>
              </div>
              <el-switch v-model="notifySettings.newBook" active-color="#6366f1" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：我的借阅记录 -->
      <el-col :span="14">
        <el-card shadow="never" class="borrow-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><History /></el-icon> 我的借阅记录</span>
              <el-button text type="primary" size="small">查看全部</el-button>
            </div>
          </template>

          <div class="borrow-list">
            <div v-if="myBorrows.length === 0" class="empty-borrow">
              <el-empty description="暂无借阅记录" :image-size="80" />
            </div>
            <div v-for="record in myBorrows" :key="record.id" class="borrow-item">
              <div class="borrow-item__cover">
                <img :src="`https://picsum.photos/seed/library-book-${record.bookId}/60/80`" :alt="record.bookName" />
              </div>
              <div class="borrow-item__info">
                <h4 class="borrow-item__title">{{ record.bookName }}</h4>
                <div class="borrow-item__meta">
                  <span class="meta-item">借阅日期：{{ record.borrowDate }}</span>
                  <span class="meta-item">应还日期：{{ record.dueDate }}</span>
                </div>
                <div class="borrow-item__status">
                  <span :class="['status-badge', getStatusClass(record.status)]">
                    {{ getStatusText(record.status) }}
                  </span>
                  <span v-if="record.status === 'overdue'" class="overdue-days">
                    已逾期{{ getOverdueDays(record) }}天
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
.stats-row {
  margin-bottom: 20px;
}

/* 统计卡片 */
.stat-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f2f3f5;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-card--blue .stat-card__icon {
  background: #e8f3ff;
  color: #165dff;
}
.stat-card--green .stat-card__icon {
  background: #e8ffea;
  color: #00b42a;
}
.stat-card--orange .stat-card__icon {
  background: #fff7e8;
  color: #ff7d00;
}
.stat-card--red .stat-card__icon {
  background: #ffece8;
  color: #f53f3f;
}
.stat-card--purple .stat-card__icon {
  background: #f5e8ff;
  color: #722ed1;
}
.stat-card--pink .stat-card__icon {
  background: #ffe8f0;
  color: #d6006c;
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.stat-card__number {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  color: #1d2129;
}
.stat-card__label {
  font-size: 12px;
  margin-top: 2px;
  color: #86909c;
}

/* 个人信息卡片 */
.profile-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.profile-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}
.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 140px;
}
.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #165dff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 600;
}
.profile-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.profile-descriptions {
  flex: 1;
}

/* 通知设置卡片 */
.notify-card {
  margin-bottom: 20px;
}
.notify-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.notify-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notify-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.notify-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}
.notify-desc {
  font-size: 12px;
  color: #64748b;
}

/* 借阅记录卡片 */
.borrow-card {
  height: 100%;
}
.borrow-list {
  max-height: 600px;
  overflow-y: auto;
}
.empty-borrow {
  padding: 40px 0;
}
.borrow-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s;
}
.borrow-item:hover {
  background: #f8fafc;
}
.borrow-item__cover {
  width: 60px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.borrow-item__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.borrow-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.borrow-item__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.borrow-item__meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
}
.borrow-item__status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.status--borrowing {
  background: #dbeafe;
  color: #1e40af;
}
.status--overdue {
  background: #fee2e2;
  color: #991b1b;
}
.status--returned {
  background: #d1fae5;
  color: #065f46;
}
.status--overdue_returned {
  background: #fef3c7;
  color: #92400e;
}
.overdue-days {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-row .el-col {
    margin-bottom: 16px;
  }
}
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  .profile-avatar {
    align-self: center;
  }
}
</style>
