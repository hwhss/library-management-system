import { supabase } from '../utils/supabase.js'

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 仪表盘统计：图书数、读者数、在借/逾期、分类分布、热门图书、借阅趋势
 */
export async function getDashboardStats() {
  const todayStr = today()

  const [{ data: books }, { data: readers }, { data: records }] = await Promise.all([
    supabase.from('books').select('id, category'),
    supabase.from('readers').select('id'),
    supabase.from('borrow_records').select('book_id, status, borrow_date, due_date')
  ])

  const bookList = books || []
  const readerList = readers || []
  const recordList = records || []

  // 在借 / 逾期
  const activeBorrowCount = recordList.filter(r => r.status === 'borrowing').length
  const overdueCount = recordList.filter(r =>
    (r.status === 'borrowing' || r.status === 'overdue') && r.due_date < todayStr
  ).length

  // 分类分布
  const categoryMap = {}
  bookList.forEach(b => {
    const cat = b.category || '其他'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })
  const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // 热门图书（按 book_id 计数，再查书名）
  const bookCountMap = {}
  recordList.forEach(r => { bookCountMap[r.book_id] = (bookCountMap[r.book_id] || 0) + 1 })
  const hotBookIds = Object.entries(bookCountMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)
  let hotBooks = []
  if (hotBookIds.length) {
    const { data: hotBookRows } = await supabase.from('books').select('id, name').in('id', hotBookIds)
    const nameMap = {}
    ;(hotBookRows || []).forEach(b => { nameMap[b.id] = b.name })
    hotBooks = Object.entries(bookCountMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, count]) => ({ name: nameMap[id] || `图书#${id}`, count }))
  }

  // 近6个月借阅趋势
  const monthSet = new Set()
  recordList.forEach(r => { if (r.borrow_date) monthSet.add(r.borrow_date.slice(0, 7)) })
  const sortedMonths = Array.from(monthSet).sort()
  const recent = sortedMonths.slice(-6)
  const monthlyTrend = recent.length
    ? recent.map(m => ({ month: m, count: recordList.filter(r => r.borrow_date?.startsWith(m)).length }))
    : [{ month: '暂无数据', count: 0 }]

  return {
    code: 200,
    message: '操作成功',
    data: {
      bookCount: bookList.length,
      readerCount: readerList.length,
      activeBorrowCount,
      overdueCount,
      categoryDistribution,
      hotBooks,
      monthlyTrend
    }
  }
}
