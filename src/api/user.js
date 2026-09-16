import { supabase } from '../utils/supabase.js'

function toCamel(r) {
  return r ? { ...r, studentId: r.student_id, registerTime: r.register_time } : r
}
function toSnake(r = {}) {
  const out = { ...r }
  if (out.studentId !== undefined) { out.student_id = out.studentId; delete out.studentId }
  if (out.registerTime !== undefined) { out.register_time = out.registerTime; delete out.registerTime }
  return out
}

/**
 * 获取读者列表（keyword 模糊搜索、分页）
 */
export async function getReaderList(params = {}) {
  let q = supabase.from('readers').select('*', { count: 'exact' })
  if (params.keyword) {
    q = q.or(`name.ilike.%${params.keyword}%,phone.ilike.%${params.keyword}%,student_id.ilike.%${params.keyword}%`)
  }
  if (params.page && params.pageSize) {
    const from = (params.page - 1) * params.pageSize
    q = q.range(from, from + params.pageSize - 1)
  }
  q = q.order('id', { ascending: false })
  const { data, count, error } = await q
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: { list: (data || []).map(toCamel), total: count || 0 } }
}

export async function createReader(payload) {
  const { data, error } = await supabase.from('readers').insert(toSnake(payload)).select().single()
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: toCamel(data) }
}

export async function updateReader(id, payload) {
  const { data, error } = await supabase.from('readers').update(toSnake(payload)).eq('id', id).select().single()
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: toCamel(data) }
}

export async function toggleReaderStatus(id) {
  // 先查当前状态再切换
  const { data: cur } = await supabase.from('readers').select('status').eq('id', id).single()
  const next = cur?.status === 'normal' ? 'disabled' : 'normal'
  const { data, error } = await supabase.from('readers').update({ status: next }).eq('id', id).select().single()
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: toCamel(data) }
}
