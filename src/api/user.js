import request from '../utils/request.js'

/**
 * 获取读者列表
 * @param {Object} params 查询参数（keyword, page, pageSize）
 * @returns {Promise} 分页数据
 */
export async function getReaderList(params) {
  const response = await request.get('/users', { params })
  return response.data
}

/**
 * 新增读者
 * @param {Object} payload 读者数据
 * @returns {Promise} 新读者
 */
export async function createReader(payload) {
  const response = await request.post('/users', payload)
  return response.data
}

/**
 * 更新读者
 * @param {Number} id 读者ID
 * @param {Object} payload 读者数据
 * @returns {Promise} 更新后的读者
 */
export async function updateReader(id, payload) {
  const response = await request.put(`/users/${id}`, payload)
  return response.data
}

/**
 * 切换读者状态（启用/禁用）
 * @param {Number} id 读者ID
 * @returns {Promise} 更新后的读者
 */
export async function toggleReaderStatus(id) {
  const response = await request.patch(`/users/${id}/status`)
  return response.data
}
