<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardStats } from '../../api/stats.js'
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
    title: { text: '图书分类分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c}本 ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    color: ['#165dff', '#10b981', '#ff7d00', '#f53f3f', '#722ed1', '#13c2c2'],
    series: [{
      name: '图书分类',
      type: 'pie',
      radius: ['40%', '60%'],
      center: ['50%', '45%'],
      data: stats.value.categoryDistribution,
      label: { fontSize: 12 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.1)' } }
    }]
  }

  categoryChart.setOption(option)
}

// 热门图书排行柱状图
function renderHotBooksChart() {
  if (!hotBooksChartRef.value) return
  hotBooksChart = echarts.init(hotBooksChartRef.value)

  // 横向柱状图
  const names = stats.value.hotBooks.map(b => b.name).reverse()
  const counts = stats.value.hotBooks.map(b => b.count).reverse()

  const option = {
    title: { text: '热门图书TOP5', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'value',
      minInterval: 1
    },
    yAxis: { 
      type: 'category', 
      data: names,
      axisLabel: {
        width: 140,
        overflow: 'truncate',
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'bar',
      data: counts,
      itemStyle: { 
        color: '#165dff',
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: 20,
      label: { show: true, position: 'right', fontSize: 12 }
    }]
  }

  hotBooksChart.setOption(option)
}

// 借阅趋势折线图
function renderTrendChart() {
  if (!trendChartRef.value) return
  console.log('借阅趋势数据:', stats.value.monthlyTrend)
  trendChart = echarts.init(trendChartRef.value)

  const months = stats.value.monthlyTrend.map(t => t.month)
  const counts = stats.value.monthlyTrend.map(t => t.count)

  const option = {
    title: { text: '近6个月借阅趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: months,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: { 
      type: 'value', 
      minInterval: 1
    },
    series: [{
      name: '借阅数量',
      type: 'line',
      data: counts,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#10b981' },
      lineStyle: { width: 2 },
      areaStyle: { 
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
          ]
        }
      }
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
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card stat-card--blue">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.bookCount }}</div>
            <div class="stat-card__label">图书总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card--green">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.readerCount }}</div>
            <div class="stat-card__label">读者总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card--orange">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.activeBorrowCount }}</div>
            <div class="stat-card__label">当前借阅</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card--red">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ stats.overdueCount }}</div>
            <div class="stat-card__label">逾期未还</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表行1：分类分布 + 热门图书 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="categoryChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="hotBooksChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表行2：借阅趋势 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="24">
        <el-card shadow="never">
          <div style="margin-bottom: 8px; color: #666; font-size: 12px;">
            调试：{{ JSON.stringify(stats.monthlyTrend) }}
          </div>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
/* 统计卡片 */
.stat-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f2f3f5;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 彩色图标背景 */
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

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card__icon svg {
  width: 24px;
  height: 24px;
}

.stat-card__content {
  flex: 1;
}
.stat-card__number {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: #1d2129;
}
.stat-card__label {
  font-size: 13px;
  margin-top: 4px;
  color: #86909c;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stat-card__number {
    font-size: 24px;
  }
  .stat-card__icon {
    width: 40px;
    height: 40px;
  }
}
</style>
