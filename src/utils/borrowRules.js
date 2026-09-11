// 借阅状态计算工具函数

/**
 * 获取当前日期（YYYY-MM-DD格式）
 * 避免 toISOString() 造成的时区偏差
 */
export function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 根据借阅记录和当前日期，计算派生状态
 * @param {Object} record 借阅记录
 * @param {String} today 当前日期 YYYY-MM-DD
 * @returns {String} 派生状态
 */
export function getDerivedBorrowStatus(record, today) {
  // 已归还的直接返回原状态
  if (record.status === 'returned' || record.status === 'overdue_returned') {
    return record.status
  }

  // 未归还的，根据应还日期判断
  if (today <= record.dueDate) {
    return 'borrowing'
  } else {
    return 'overdue'
  }
}

/**
 * 批量刷新所有借阅记录的状态
 * @param {Array} records 借阅记录数组
 * @param {String} today 当前日期
 * @returns {Array} 刷新后的记录
 */
export function refreshBorrowStatuses(records, today = getTodayString()) {
  return records.map(record => ({
    ...record,
    status: getDerivedBorrowStatus(record, today)
  }))
}

/**
 * 判断记录是否是未归还的（借阅中或逾期）
 * @param {Object} record 借阅记录
 * @returns {Boolean}
 */
export function isOutstanding(record) {
  return record.status === 'borrowing' || record.status === 'overdue'
}

/**
 * 判断读者是否有未归还的图书
 * @param {Number} readerId 读者ID
 * @param {Array} borrowRecords 借阅记录
 * @returns {Boolean}
 */
export function hasReaderOutstandingBorrow(readerId, borrowRecords) {
  return borrowRecords.some(record => 
    record.readerId === readerId && isOutstanding(record)
  )
}

/**
 * 计算应还日期
 * @param {String} borrowDate 借阅日期 YYYY-MM-DD
 * @param {Number} days 借阅天数
 * @returns {String} 应还日期 YYYY-MM-DD
 */
export function calculateDueDate(borrowDate, days) {
  const date = new Date(borrowDate)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
