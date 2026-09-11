import request from '../utils/request.js'

/**
 * 获取借阅记录列表
 * @param {Object} params 查询参数（status, page, pageSize）
 * @returns {Promise} 分页数据
 */
export async function getBorrowList(params) {
  const response = await request.get('/borrow', { params })
  return response.data
}

/**
 * 新增借阅（借书）
 * @param {Object} payload 借阅数据（bookId, readerId, borrowDays）
 * @returns {Promise} 新借阅记录
 */
export async function createBorrow(payload) {
  const response = await request.post('/borrow', payload)
  return response.data
}

/**
 * 还书
 * @param {Number} id 借阅记录ID
 * @returns {Promise} 更新后的借阅记录
 */
export async function returnBook(id) {
  const response = await request.put(`/borrow/${id}/return`)
  return response.data
}

/**
 * 获取可借阅的图书列表（库存>0）
 * @returns {Promise} 图书列表
 */
export async function getAvailableBooks() {
  const response = await request.get('/books')
  // 前端筛选库存>0的
  const allBooks = response.data.data.list || response.data.data
  return { data: { list: allBooks.filter(b => b.stock > 0) } }
}

/**
 * 获取可借阅的读者列表（状态正常）
 * @returns {Promise} 读者列表
 */
export async function getAvailableReaders() {
  const response = await request.get('/users')
  const allUsers = response.data.data.list || response.data.data
  return { data: { list: allUsers.filter(u => u.status === 'normal') } }
}
