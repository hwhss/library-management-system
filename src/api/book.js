import { supabase } from '../utils/supabase.js'

// 数据库下划线字段 -> 前端驼峰字段
function toCamelBook(b) {
  return b ? { ...b, createdAt: b.created_at } : b
}
function toSnakeBook(b = {}) {
  const out = { ...b }
  if (out.createdAt !== undefined) { out.created_at = out.createdAt; delete out.createdAt }
  return out
}

/**
 * 获取图书列表（name模糊搜索、category筛选、分页）
 */
export async function getBookList(params = {}) {
  let q = supabase.from('books').select('*', { count: 'exact' })
  if (params.name) q = q.ilike('name', `%${params.name}%`)
  if (params.category && params.category !== '其他') q = q.eq('category', params.category)
  if (params.page && params.pageSize) {
    const from = (params.page - 1) * params.pageSize
    q = q.range(from, from + params.pageSize - 1)
  }
  q = q.order('id', { ascending: false })
  const { data, count, error } = await q
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: { list: (data || []).map(toCamelBook), total: count || 0 } }
}

export async function createBook(payload) {
  const { data, error } = await supabase.from('books').insert(toSnakeBook(payload)).select().single()
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: toCamelBook(data) }
}

export async function updateBook(id, payload) {
  const { data, error } = await supabase.from('books').update(toSnakeBook(payload)).eq('id', id).select().single()
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: toCamelBook(data) }
}

export async function deleteBook(id) {
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: true }
}
