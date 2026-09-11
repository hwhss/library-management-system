<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid, List, Plus, Search, Refresh, Delete } from '@element-plus/icons-vue'
import { getBookList, deleteBook } from '../../api/book.js'
import BookFormDialog from './BookFormDialog.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const viewMode = ref('table') // table / grid
const selectedBooks = ref([]) // 选中的图书

// 搜索条件
const searchForm = reactive({
  name: '',
  category: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 弹窗
const dialogVisible = ref(false)
const currentBook = ref(null)

const categories = ['文学', '科技', '历史', '艺术', '其他']

// 获取图书列表
async function fetchBooks() {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const result = await getBookList(params)
    tableData.value = result.data.list
    total.value = result.data.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取图书列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchBooks()
}

// 重置
function handleReset() {
  searchForm.name = ''
  searchForm.category = ''
  pagination.page = 1
  fetchBooks()
}

// 新增
function handleAdd() {
  currentBook.value = null
  dialogVisible.value = true
}

// 编辑
function handleEdit(book) {
  currentBook.value = book
  dialogVisible.value = true
}

// 删除
async function handleDelete(book) {
  try {
    await ElMessageBox.confirm(
      `确定要删除《${book.name}》吗？`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return // 用户取消
  }

  try {
    await deleteBook(book.id)
    ElMessage.success('删除成功')
    fetchBooks()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

// 操作成功后刷新
function handleSuccess() {
  fetchBooks()
}

// 多选变化
function handleSelectionChange(selection) {
  selectedBooks.value = selection
}

// 批量删除
async function handleBatchDelete() {
  if (selectedBooks.value.length === 0) {
    ElMessage.warning('请先选择要删除的图书')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedBooks.value.length} 本图书吗？此操作不可恢复。`,
      '批量删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return // 用户取消
  }

  // 逐个删除（Mock模式）
  try {
    for (const book of selectedBooks.value) {
      await deleteBook(book.id)
    }
    ElMessage.success(`成功删除 ${selectedBooks.value.length} 本图书`)
    selectedBooks.value = []
    fetchBooks()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '批量删除失败')
  }
}

// 分类标签颜色
function getCategoryType(category) {
  const map = {
    '文学': 'danger',
    '科技': 'primary',
    '历史': 'warning',
    '艺术': 'success',
    '其他': 'info'
  }
  return map[category] || 'info'
}

// 库存状态样式
function getStockStatus(stock) {
  if (stock === 0) return { text: '无库存', class: 'stock-out' }
  if (stock <= 2) return { text: '库存紧张', class: 'stock-low' }
  return { text: '库存充足', class: 'stock-ok' }
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="书名">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索书名、作者..."
              clearable
              :prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="全部分类"
              clearable
              class="category-select"
            >
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
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
            <span style="margin-left: 6px">新增图书</span>
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
        <div v-if="selectedBooks.length > 0" class="batch-bar">
          <span class="batch-info">已选择 {{ selectedBooks.length }} 本图书</span>
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
        <el-table-column label="封面" width="80" align="center">
          <template #default="{ row }">
            <div class="cover-wrapper">
              <el-image
                :src="row.cover"
                fit="cover"
                class="book-cover"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isbn" label="ISBN" width="140" />
        <el-table-column prop="name" label="书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column label="分类" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)" size="small" effect="light">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="100" align="center">
          <template #default="{ row }">
            <div class="stock-cell">
              <span class="stock-number">{{ row.stock }}</span>
              <span :class="['stock-badge', getStockStatus(row.stock).class]">
                {{ getStockStatus(row.stock).text }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
        @current-change="fetchBooks"
        @size-change="fetchBooks"
      />
      </template>
    </el-card>

    <!-- 网格视图 -->
    <el-card v-else shadow="never" class="grid-card">
      <!-- 骨架屏加载 -->
      <div v-if="loading" class="book-grid-skeleton">
        <div v-for="i in 8" :key="i" class="skeleton-card">
          <el-skeleton variant="rect" style="width: 100%; height: 240px; border-radius: 12px" />
          <el-skeleton style="margin-top: 12px" :rows="2" animated />
        </div>
      </div>
      
      <div v-else class="book-grid">
        <div v-for="book in tableData" :key="book.id" class="book-card">
          <div class="book-card__cover">
            <el-image :src="book.cover" fit="cover" class="cover-img" />
            <div class="book-card__overlay">
              <el-button size="small" type="primary" @click="handleEdit(book)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(book)">删除</el-button>
            </div>
          </div>
          <div class="book-card__info">
            <h3 class="book-card__name" :title="book.name">{{ book.name }}</h3>
            <p class="book-card__author">{{ book.author }}</p>
            <div class="book-card__meta">
              <el-tag :type="getCategoryType(book.category)" size="small" effect="light">
                {{ book.category }}
              </el-tag>
              <span :class="['stock-badge', getStockStatus(book.stock).class]">
                库存 {{ book.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <el-empty description="暂无图书数据" />
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
        @current-change="fetchBooks"
        @size-change="fetchBooks"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <BookFormDialog
      v-model:visible="dialogVisible"
      :book="currentBook"
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
.category-select {
  width: 130px;
}
.table-card,
.grid-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 表格封面 */
.cover-wrapper {
  display: flex;
  justify-content: center;
}
.book-cover {
  width: 40px;
  height: 54px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 库存状态 */
.stock-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stock-number {
  font-weight: 600;
  font-size: 14px;
  color: #1d2129;
}
.stock-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.stock-ok {
  background: #e8ffea;
  color: #00b42a;
}
.stock-low {
  background: #fff7e8;
  color: #ff7d00;
}
.stock-out {
  background: #ffece8;
  color: #f53f3f;
}

/* 网格视图 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 8px 0;
}
.book-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f2f3f5;
  transition: all 0.2s ease;
  cursor: pointer;
}
.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e5e6eb;
}
.book-card__cover {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.cover-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}
.book-card:hover .cover-img {
  transform: scale(1.05);
}
.book-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.book-card:hover .book-card__overlay {
  opacity: 1;
}
.book-card__info {
  padding: 14px;
}
.book-card__name {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-card__author {
  margin: 0 0 10px;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.book-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.empty-state {
  padding: 60px 0;
}

/* 骨架屏 */
.skeleton-wrapper {
  padding: 20px 0;
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
.book-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 8px 0;
}
.skeleton-card {
  width: 100%;
}

.pagination {
  margin-top: 24px;
  justify-content: flex-end;
}
</style>
