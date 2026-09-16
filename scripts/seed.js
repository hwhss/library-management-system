// 一次性迁移脚本：把 initialData.js 里的种子数据导入 Supabase
// 用法：node scripts/seed.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// 读 .env.local
const env = {}
readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

// 先以 admin 身份登录（绕过 RLS 写数据）
const { error: le } = await supabase.auth.signInWithPassword({
  email: 'admin@demo.com',
  password: '123456'
})
if (le) {
  console.error('登录 admin 失败：', le.message)
  console.error('请先在 Supabase Authentication 里创建 admin@demo.com / 123456，并在 profiles 表把 role 设为 admin')
  process.exit(1)
}
console.log('admin 登录成功')

// 从 initialData.js 拿数据（它是 ESM，动态 import）
const { initialLibraryData } = await import('../src/mock/initialData.js')

// books: 驼峰 -> 下划线（created_at 用数据库默认值，避免原数据里的非法日期）
const books = initialLibraryData.books.map(b => ({
  isbn: b.isbn,
  name: b.name,
  author: b.author,
  category: b.category,
  stock: b.stock,
  description: b.description,
  cover: b.cover
}))

// readers: 驼峰 -> 下划线，去掉 password
const readers = initialLibraryData.users.map(r => ({
  name: r.name,
  student_id: r.studentId,
  gender: r.gender,
  phone: r.phone,
  register_time: r.registerTime,
  status: r.status,
  avatar: r.avatar
}))

console.log(`准备导入: ${books.length} 本书, ${readers.length} 个读者`)

// 先清空（避免重复）
await supabase.from('borrow_records').delete().neq('id', 0)
await supabase.from('books').delete().neq('id', 0)
await supabase.from('readers').delete().neq('id', 0)

const { error: eb } = await supabase.from('books').insert(books)
console.log('导入 books:', eb ? '失败 ' + eb.message : '成功')

const { error: er } = await supabase.from('readers').insert(readers)
console.log('导入 readers:', er ? '失败 ' + er.message : '成功')

console.log('完成！去 Supabase Table Editor 刷新看看。')
