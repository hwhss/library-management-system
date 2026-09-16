<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid, List, Plus, Search, Refresh, Delete } from '@element-plus/icons-vue'
import { getReaderList, toggleReaderStatus } from '../../api/user.js'
import { hasOutstandingBorrow } from '../../utils/validators.js'
import { getBorrowList } from '../../api/borrow.js'
import UserFormDialog from './UserFormDialog.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const allRecords = ref([])
const viewMode = ref('table') // table / grid
const selectedReaders = ref([]) // 选中的读者

// 搜索条件
const searchForm = reactive({
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 弹窗
const dialogVisible = ref(false)
const currentReader = ref(null)

// 获取读者列表
async function fetchReaders() {
  loading.value = true
  try {
    const params = {
      keyword: searchForm.keyword,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const result = await getReaderList(params)
    tableData.value = result.data.list
    total.value = result.data.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取读者列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchReaders()
}

// 重置
function handleReset() {
  searchForm.keyword = ''
  pagination.page = 1
  fetchReaders()
}

// 新增
function handleAdd() {
  currentReader.value = null
  dialogVisible.value = true
}

// 编辑
function handleEdit(reader) {
  currentReader.value = reader
  dialogVisible.value = true
}

// 切换状态（启用/禁用）
async function handleToggleStatus(reader) {
  const isDisabling = reader.status === 'normal'

  // 禁用前检查是否有未归还借阅
  if (isDisabling) {
    const records = allRecords.value
  const hasOutstanding = hasOutstandingBorrow(reader.id, records)
    
    if (hasOutstanding) {
      try {
        await ElMessageBox.confirm(
          '该读者有未归还图书，禁用后将无法新增借阅。确定要禁用吗？',
          '禁用确认',
          { confirmButtonText: '确定禁用', cancelButtonText: '取消', type: 'warning' }
        )
      } catch {
        return // 用户取消
      }
    } else {
      try {
        await ElMessageBox.confirm(
          `确定要禁用读者「${reader.name}」吗？`,
          '禁用确认',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        )
      } catch {
        return
      }
    }
  }

  try {
    await toggleReaderStatus(reader.id)
    ElMessage.success(isDisabling ? '已禁用' : '已启用')
    fetchReaders()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 操作成功后刷新
function handleSuccess() {
  fetchReaders()
}

// 多选变化
function handleSelectionChange(selection) {
  selectedReaders.value = selection
}

// 批量删除
async function handleBatchDelete() {
  if (selectedReaders.value.length === 0) {
    ElMessage.warning('请先选择要删除的读者')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedReaders.value.length} 位读者吗？此操作不可恢复。`,
      '批量删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return // 用户取消
  }

  // Mock模式：直接刷新
  ElMessage.success(`成功删除 ${selectedReaders.value.length} 位读者`)
  selectedReaders.value = []
  fetchReaders()
}

// 状态样式
function getStatusClass(status) {
  return status === 'normal' ? 'status-active' : 'status-disabled'
}

onMounted(async () => {
  const r = await getBorrowList({ pageSize: 1000 })
  allRecords.value = r.data.list
  fetchReaders()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="搜索">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索姓名、学号、手机号..."
              clearable
              :prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              <span style="margin-left: 6px">搜索</span>
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              <span style="margin-left: 6px">重置</span>
            </el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar-actions">
          <!-- 视图切换 -->
          <el-radio-group v-model="viewMode" size="default" class="view-toggle">
            <el-radio-button value="table">
              <el-icon><List /></el-icon>
            </el-radio-button>
            <el-radio-button value="grid">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            <span style="margin-left: 6px">新增读者</span>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格视图 -->
    <el-card v-if="viewMode === 'table'" shadow="never" class="table-card">
      <!-- 骨架屏加载 -->
      <div v-if="loading" class="skeleton-wrapper">
        <el-skeleton :rows="8" animated />
      </div>
      
      <template v-else>
        <!-- 批量操作栏 -->
        <div v-if="selectedReaders.length > 0" class="batch-bar">
          <span class="batch-info">已选择 {{ selectedReaders.length }} 位读者</span>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            <span style="margin-left: 4px">批量删除</span>
          </el-button>
        </div>

        <el-table
          :data="tableData"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="头像" width="70" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" class="user-avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="gender" label="性别" width="70" align="center" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="registerTime" label="注册时间" width="110" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              {{ row.status === 'normal' ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 'normal' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'normal' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="!loading"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @current-change="fetchReaders"
        @size-change="fetchReaders"
      />
      </template>
    </el-card>

    <!-- 网格视图 -->
    <el-card v-else shadow="never" class="grid-card">
      <!-- 骨架屏加载 -->
      <div v-if="loading" class="user-grid-skeleton">
        <div v-for="i in 6" :key="i" class="skeleton-user-card">
          <el-skeleton :rows="4" animated />
        </div>
      </div>
      
      <div v-else class="user-grid">
        <div v-for="reader in tableData" :key="reader.id" class="user-card">
          <div class="user-card__header">
            <el-avatar :size="56" :src="reader.avatar" class="user-card__avatar" />
            <span :class="['status-badge', getStatusClass(reader.status)]">
              {{ reader.status === 'normal' ? '正常' : '禁用' }}
            </span>
          </div>
          <div class="user-card__info">
            <h3 class="user-card__name">{{ reader.name }}</h3>
            <p class="user-card__id">学号：{{ reader.studentId }}</p>
            <p class="user-card__phone">📱 {{ reader.phone }}</p>
          </div>
          <div class="user-card__actions">
            <el-button size="small" @click="handleEdit(reader)">编辑</el-button>
            <el-button 
              size="small" 
              :type="reader.status === 'normal' ? 'warning' : 'success'"
              @click="handleToggleStatus(reader)"
            >
              {{ reader.status === 'normal' ? '禁用' : '启用' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <el-empty description="暂无读者数据" />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="!loading && tableData.length > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @current-change="fetchReaders"
        @size-change="fetchReaders"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <UserFormDialog
      v-model:visible="dialogVisible"
      :reader="currentReader"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.search-card {
  margin-bottom: 20px;
}
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.search-form {
  flex: 1;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.view-toggle {
  border-radius: 6px;
  overflow: hidden;
}
.table-card,
.grid-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 表格头像 */
.user-avatar {
  background: #165dff;
  color: white;
  font-weight: 600;
}

/* 状态标签 */
.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}
.status-active {
  background: #e8ffea;
  color: #00b42a;
}
.status-disabled {
  background: #ffece8;
  color: #f53f3f;
}

/* 网格视图 */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 8px 0;
}
.user-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f2f3f5;
  transition: all 0.2s ease;
}
.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e5e6eb;
}
.user-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.user-card__avatar {
  background: #165dff;
  color: white;
  font-weight: 600;
  font-size: 20px;
}
.user-card__name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}
.user-card__id,
.user-card__phone {
  margin: 0 0 6px;
  font-size: 13px;
  color: #86909c;
}
.user-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.empty-state {
  padding: 60px 0;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #ffece8;
  border-radius: 6px;
  border: 1px solid #ffcfc8;
}
.batch-info {
  font-size: 13px;
  color: #f53f3f;
  font-weight: 500;
}

.pagination {
  margin-top: 24px;
  justify-content: flex-end;
}
</style>
