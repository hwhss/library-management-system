<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getBorrowList, returnBook } from '../../api/borrow.js'
import BorrowFormDialog from './BorrowFormDialog.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 筛选条件
const filterForm = reactive({
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 弹窗
const dialogVisible = ref(false)

// 状态选项
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'borrowing', label: '借阅中' },
  { value: 'overdue', label: '逾期' },
  { value: 'returned', label: '已归还' },
  { value: 'overdue_returned', label: '逾期归还' }
]

// 获取借阅记录列表
async function fetchBorrowList() {
  loading.value = true
  try {
    const params = {
      status: filterForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const result = await getBorrowList(params)
    tableData.value = result.data.list
    total.value = result.data.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取借阅记录失败')
  } finally {
    loading.value = false
  }
}

// 筛选
function handleFilter() {
  pagination.page = 1
  fetchBorrowList()
}

// 重置
function handleReset() {
  filterForm.status = ''
  pagination.page = 1
  fetchBorrowList()
}

// 新增借阅
function handleAdd() {
  dialogVisible.value = true
}

// 还书
async function handleReturn(record) {
  try {
    await ElMessageBox.confirm(
      `确定要归还《${record.bookName}》吗？`,
      '还书确认',
      { confirmButtonText: '确定归还', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return // 用户取消
  }

  try {
    await returnBook(record.id)
    ElMessage.success('还书成功')
    fetchBorrowList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '还书失败')
  }
}

// 操作成功后刷新
function handleSuccess() {
  fetchBorrowList()
}

// 状态样式
function getStatusClass(status) {
  const map = {
    'borrowing': 'status-borrowing',
    'overdue': 'status-overdue',
    'returned': 'status-returned',
    'overdue_returned': 'status-overdue-returned'
  }
  return map[status] || 'status-default'
}

// 状态文字
function getStatusText(status) {
  const map = {
    'borrowing': '借阅中',
    'overdue': '已逾期',
    'returned': '已归还',
    'overdue_returned': '逾期归还'
  }
  return map[status] || status
}

// 计算逾期天数
function getOverdueDays(record) {
  if (record.status !== 'overdue' || !record.dueDate) return 0
  const due = new Date(record.dueDate)
  const now = new Date()
  const diff = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

onMounted(() => {
  fetchBorrowList()
})
</script>

<template>
  <div>
    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="状态">
            <el-select
              v-model="filterForm.status"
              placeholder="全部状态"
              clearable
              class="status-select"
            >
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Search /></el-icon>
              <span style="margin-left: 6px">筛选</span>
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              <span style="margin-left: 6px">重置</span>
            </el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 6px">新增借阅</span>
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <!-- 骨架屏加载 -->
      <div v-if="loading" class="skeleton-wrapper">
        <el-skeleton :rows="8" animated />
      </div>
      
      <template v-else>
        <el-table
          :data="tableData"
          stripe
          style="width: 100%"
        >
        <el-table-column prop="bookName" label="图书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="readerName" label="读者名" width="100" />
        <el-table-column prop="borrowDate" label="借阅时间" width="110" />
        <el-table-column prop="dueDate" label="应还时间" width="110">
          <template #default="{ row }">
            <div class="due-date">
              <span>{{ row.dueDate }}</span>
              <span v-if="row.status === 'overdue'" class="overdue-days">
                已逾期{{ getOverdueDays(row) }}天
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="归还时间" width="110">
          <template #default="{ row }">
            {{ row.returnDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.returnDate"
              size="small"
              type="success"
              @click="handleReturn(row)"
            >
              还书
            </el-button>
            <span v-else class="done-text">✓ 已完成</span>
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
        @current-change="fetchBorrowList"
        @size-change="fetchBorrowList"
      />
      </template>
    </el-card>

    <!-- 新增借阅弹窗 -->
    <BorrowFormDialog
      v-model:visible="dialogVisible"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.filter-form {
  flex: 1;
}
.status-select {
  width: 140px;
}
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 到期日期 */
.due-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.overdue-days {
  font-size: 11px;
  color: #f53f3f;
  font-weight: 500;
}

/* 状态标签 */
.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}
.status-borrowing {
  background: #e8f3ff;
  color: #165dff;
}
.status-overdue {
  background: #ffece8;
  color: #f53f3f;
}
.status-returned {
  background: #e8ffea;
  color: #00b42a;
}
.status-overdue-returned {
  background: #fff7e8;
  color: #ff7d00;
}
.status-default {
  background: #f2f3f5;
  color: #86909c;
}

.done-text {
  color: #c9cdd4;
  font-size: 12px;
}

.pagination {
  margin-top: 24px;
  justify-content: flex-end;
}
</style>
