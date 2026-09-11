import request from '../utils/request.js'

/**
 * 获取图书列表
 * @param {Object} params 查询参数（name, category, page, pageSize）
 * @returns {Promise} 分页数据
 */
export async function getBookList(params) {
  const response = await request.get('/books', { params })
  return response.data
}

/**
 * 新增图书
 * @param {Object} payload 图书数据
 * @returns {Promise} 新图书
 */
export async function createBook(payload) {
  const response = await request.post('/books', payload)
  return response.data
}

/**
 * 更新图书
 * @param {Number} id 图书ID
 * @param {Object} payload 图书数据
 * @returns {Promise} 更新后的图书
 */
export async function updateBook(id, payload) {
  const response = await request.put(`/books/${id}`, payload)
  return response.data
}

/**
 * 删除图书
 * @param {Number} id 图书ID
 * @returns {Promise}
 */
export async function deleteBook(id) {
  const response = await request.delete(`/books/${id}`)
  return response.data
}
