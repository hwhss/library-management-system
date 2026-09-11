<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardStats } from '../api/stats.js'
import * as echarts from 'echarts'

const loading = ref(false)

// 统计数据
const stats = ref({
  bookCount: 0,
  readerCount: 0,
  activeBorrowCount: 0,
  overdueCount: 0,
  categoryDistribution: [],
  hotBooks: [],
  monthlyTrend: []
})

// ECharts实例
let categoryChart = null
let hotBooksChart = null
let trendChart = null

// 图表DOM引用
const categoryChartRef = ref(null)
const hotBooksChartRef = ref(null)
const trendChartRef = ref(null)

// Apple 图表色板
const chartPalette = ['#007aff', '#34c759', '#ff9500', '#5856d6', '#af52de', '#5ac8fa', '#ff3b30', '#ffcc00']

// 获取统计数据
async function fetchStats() {
  loading.value = true
  try {
    const result = await getDashboardStats()
    stats.value = result.data
    await nextTick()
    renderCharts()
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染所有图表
function renderCharts() {
  renderCategoryChart()
  renderHotBooksChart()
  renderTrendChart()
}

// 图书分类分布饼图
function renderCategoryChart() {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value)

  const option = {
    color: chartPalette,
    title: { text: '图书分类分布', left: 'center', textStyle: { fontSize: 15, fontWeight: 600, color: '#1d1d1f' } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}本 ({d}%)', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e5e5ea', textStyle: { color: '#1d1d1f' }, padding: 12, borderRadius: 12 },
    legend: { bottom: 0, type: 'scroll', textStyle: { color: '#6e6e73' } },
    series: [{
      name: '图书分类',
      type: 'pie',
      radius: ['42%', '62%'],
      center: ['50%', '48%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: stats.value.categoryDistribution,
      emphasis: { itemStyle: { shadowBlur: 16, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.12)' } }
    }]
  }

  categoryChart.setOption(option)
}

// 热门图书排行柱状图
function renderHotBooksChart() {
  if (!hotBooksChartRef.value) return
  hotBooksChart = echarts.init(hotBooksChartRef.value)

  const names = stats.value.hotBooks.map(b => b.name).reverse()
  const counts = stats.value.hotBooks.map(b => b.count).reverse()

  const option = {
    color: ['#007aff'],
    title: { text: '热门图书 TOP5', left: 'center', textStyle: { fontSize: 15, fontWeight: 600, color: '#1d1d1f' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,122,255,0.08)' } }, backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e5e5ea', textStyle: { color: '#1d1d1f' }, padding: 12, borderRadius: 12 },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '16%', containLabel: true },
    xAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f2f2f7' } } },
    yAxis: { type: 'category', data: names, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#6e6e73', width: 90, overflow: 'truncate' } },
    series: [{
      name: '借阅次数',
      type: 'bar',
      data: counts,
      barWidth: 14,
      itemStyle: { borderRadius: [0, 7, 7, 0] },
      label: { show: true, position: 'right', color: '#1d1d1f', fontWeight: 600 }
    }]
  }

  hotBooksChart.setOption(option)
}

// 借阅趋势折线图
function renderTrendChart() {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)

  const months = stats.value.monthlyTrend.map(t => t.month)
  const counts = stats.value.monthlyTrend.map(t => t.count)

  const option = {
    color: ['#34c759'],
    title: { text: '近6个月借阅趋势', left: 'center', textStyle: { fontSize: 15, fontWeight: 600, color: '#1d1d1f' } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e5e5ea', textStyle: { color: '#1d1d1f' }, padding: 12, borderRadius: 12 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: months, axisLine: { lineStyle: { color: '#e5e5ea' } }, axisLabel: { color: '#6e6e73' }, axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f2f2f7' } }, axisLabel: { color: '#6e6e73' } },
    series: [{
      name: '借阅数量',
      type: 'line',
      data: counts,
      smooth: true,
      symbolSize: 8,
      lineStyle: { width: 3 },
      itemStyle: { color: '#34c759', borderWidth: 2, borderColor: '#fff' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(52,199,89,0.25)' }, { offset: 1, color: 'rgba(52,199,89,0.02)' }]) }
    }]
  }

  trendChart.setOption(option)
}

// 窗口大小变化时重绘图表
function handleResize() {
  categoryChart?.resize()
  hotBooksChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  categoryChart?.dispose()
  hotBooksChart?.dispose()
  trendChart?.dispose()
})
</script>

<template>
  <div v-loading="loading">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" :xs="24" :sm="12" :md="12" :lg="6">
        <el-card shadow="hover" class="stat-card stat-card--blue">
          <div class="stat-content">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.bookCount }}</div>
              <div class="stat-label">图书总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="12" :lg="6">
        <el-card shadow="hover" class="stat-card stat-card--green">
          <div class="stat-content">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.readerCount }}</div>
              <div class="stat-label">读者总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="12" :lg="6">
        <el-card shadow="hover" class="stat-card stat-card--amber">
          <div class="stat-content">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.activeBorrowCount }}</div>
              <div class="stat-label">当前借阅</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="12" :lg="6">
        <el-card shadow="hover" class="stat-card stat-card--red">
          <div class="stat-content">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.overdueCount }}</div>
              <div class="stat-label">逾期未还</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表行1：分类分布 + 热门图书 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12" :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <div ref="categoryChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <div ref="hotBooksChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表行2：借阅趋势 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never" class="chart-card">
          <div ref="trendChartRef" class="chart-box chart-box--wide"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card {
  border: none !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}

/* 柔和白底统计卡片 */
.stat-card--blue {
  background: #fff !important;
  border: 1px solid #f2f3f5;
}
.stat-card--green {
  background: #fff !important;
  border: 1px solid #f2f3f5;
}
.stat-card--amber {
  background: #fff !important;
  border: 1px solid #f2f3f5;
}
.stat-card--red {
  background: #fff !important;
  border: 1px solid #f2f3f5;
}

.stat-card--blue .stat-number,
.stat-card--green .stat-number,
.stat-card--amber .stat-number,
.stat-card--red .stat-number {
  color: #1d2129;
}

.stat-card--blue .stat-label,
.stat-card--green .stat-label,
.stat-card--amber .stat-label,
.stat-card--red .stat-label {
  color: #86909c;
}

.stat-card--blue .stat-icon {
  background: #e8f3ff;
  color: #165dff;
}
.stat-card--green .stat-icon {
  background: #e8ffea;
  color: #00b42a;
}
.stat-card--amber .stat-icon {
  background: #fff7e8;
  color: #ff7d00;
}
.stat-card--red .stat-icon {
  background: #ffece8;
  color: #f53f3f;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon svg {
  width: 24px;
  height: 24px;
}
.stat-info {
  flex: 1;
}
.stat-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
}

.chart-row {
  margin-top: 20px;
}
.chart-card {
  margin-bottom: 20px;
}
.chart-box {
  height: 340px;
}
.chart-box--wide {
  height: 300px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stat-number {
    font-size: 28px;
  }
  .stat-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
