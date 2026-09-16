import { supabase } from '../utils/supabase.js'

function today() {
  return new Date().toISOString().slice(0, 10)
}
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// 联表结果 -> 前端结构（bookName/readerName 冗余字段）
function toCamelRecord(r) {
  return {
    id: r.id,
    bookId: r.book_id,
    bookName: r.books?.name || '',
    readerId: r.reader_id,
    readerName: r.readers?.name || '',
    borrowDate: r.borrow_date,
    dueDate: r.due_date,
    returnDate: r.return_date,
    status: r.status
  }
}

/**
 * 借阅记录列表
 */
export async function getBorrowList(params = {}) {
  let q = supabase
    .from('borrow_records')
    .select('*, books(name), readers(name)', { count: 'exact' })
  if (params.status && params.status !== 'all') q = q.eq('status', params.status)
  if (params.page && params.pageSize) {
    const from = (params.page - 1) * params.pageSize
    q = q.range(from, from + params.pageSize - 1)
  }
  q = q.order('id', { ascending: false })
  const { data, count, error } = await q
  if (error) throw { response: { data: { message: error.message } } }
  return { code: 200, message: '操作成功', data: { list: (data || []).map(toCamelRecord), total: count || 0 } }
}

/**
 * 借书：新增记录 + 图书库存 -1
 */
export async function createBorrow(payload) {
  const borrowDate = today()
  const dueDate = addDays(borrowDate, payload.borrowDays || 30)
  const { data, error } = await supabase.from('borrow_records').insert({
    book_id: payload.bookId,
    reader_id: payload.readerId,
    borrow_date: borrowDate,
    due_date: dueDate,
    return_date: null,
    status: 'borrowing'
  }).select().single()
  if (error) throw { response: { data: { message: error.message } } }

  // 扣库存
  const { data: book } = await supabase.from('books').select('name, stock').eq('id', payload.bookId).single()
  if (book) {
    await supabase.from('books').update({ stock: Math.max(0, book.stock - 1) }).eq('id', payload.bookId)
  }
  return { code: 200, message: '操作成功', data: toCamelRecord({ ...data, books: { name: book?.name || '' }, readers: { name: '' } }) }
}

/**
 * 还书：更新记录 + 图书库存 +1
 */
export async function returnBook(id) {
  const { data: rec, error: e1 } = await supabase.from('borrow_records').select('*').eq('id', id).single()
  if (e1) throw { response: { data: { message: e1.message } } }

  const { data, error } = await supabase.from('borrow_records')
    .update({ return_date: today(), status: 'returned' })
    .eq('id', id).select().single()
  if (error) throw { response: { data: { message: error.message } } }

  if (rec.book_id) {
    const { data: book } = await supabase.from('books').select('stock').eq('id', rec.book_id).single()
    if (book) await supabase.from('books').update({ stock: book.stock + 1 }).eq('id', rec.book_id)
  }
  return { code: 200, message: '操作成功', data: toCamelRecord(data) }
}

/**
 * 可借图书（库存>0）
 */
export async function getAvailableBooks() {
  const { data } = await supabase.from('books').select('*').gt('stock', 0)
  return { data: { list: (data || []).map(b => ({ ...b, createdAt: b.created_at })) } }
}

/**
 * 可借读者（状态正常）
 */
export async function getAvailableReaders() {
  const { data } = await supabase.from('readers').select('*').eq('status', 'normal')
  return { data: { list: (data || []).map(r => ({ ...r, studentId: r.student_id, registerTime: r.register_time })) } }
}
