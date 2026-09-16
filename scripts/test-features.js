// 综合功能测试：借阅闭环 + 权限验证
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = {}
readFileSync('.env.local','utf8').split('\n').forEach(l=>{const i=l.indexOf('=');if(i>0)env[l.slice(0,i).trim()]=l.slice(i+1).trim()})
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

let pass=0, fail=0
function check(name, cond, extra=''){
  if(cond){console.log(`  ✅ ${name} ${extra}`);pass++}
  else{console.log(`  ❌ ${name} ${extra}`);fail++}
}

// 1. admin 登录
let {data:au, error:ae} = await sb.auth.signInWithPassword({email:'admin@demo.com',password:'123456'})
check('admin登录', !ae, ae?.message||'')

// 2. 查《活着》库存
let {data:book} = await sb.from('books').select('id,name,stock').eq('name','活着').single()
check('找到《活着》', !!book)
const beforeStock = book.stock
console.log(`     《活着》当前库存: ${beforeStock}`)

// 3. 找一个正常读者
let {data:reader} = await sb.from('readers').select('id,name').eq('status','normal').limit(1).single()
check('找到正常读者', !!reader, reader?.name)

// 4. 借书：插记录 + 扣库存
const today = new Date().toISOString().slice(0,10)
const due = new Date(Date.now()+30*86400000).toISOString().slice(0,10)
const {error:be} = await sb.from('borrow_records').insert({book_id:book.id, reader_id:reader.id, borrow_date:today, due_date:due, status:'borrowing'})
check('借书记录插入', !be, be?.message||'')
await sb.from('books').update({stock:book.stock-1}).eq('id',book.id)
let {data:book2} = await sb.from('books').select('stock').eq('id',book.id).single()
check('借书后库存-1', book2.stock === beforeStock-1, `: ${beforeStock}->${book2.stock}`)

// 5. 还书：更新记录 + 加库存
const {data:rec} = await sb.from('borrow_records').select('id').eq('book_id',book.id).eq('status','borrowing').order('id',{ascending:false}).limit(1).single()
await sb.from('borrow_records').update({return_date:today,status:'returned'}).eq('id',rec.id)
await sb.from('books').update({stock:book2.stock+1}).eq('id',book.id)
let {data:book3} = await sb.from('books').select('stock').eq('id',book.id).single()
check('还书后库存+1', book3.stock === beforeStock, `: ${book2.stock}->${book3.stock}`)

// 6. 清理测试数据
await sb.from('borrow_records').delete().eq('id',rec.id)
await sb.auth.signOut()

// 7. user 登录，验证权限
let {data:uu} = await sb.auth.signInWithPassword({email:'user@demo.com',password:'123456'})
check('user登录', !!uu?.user)
let {error:writeErr} = await sb.from('books').insert({isbn:'FAKE-TEST',name:'越权测试',author:'x',category:'x',stock:1})
check('user不能写books(RLS拦截)', !!writeErr, writeErr?.message?.slice(0,40)||'未拦截!')
let {data:readOk} = await sb.from('books').select('id').limit(1)
check('user能读books', !!readOk)
await sb.auth.signOut()

console.log(`\n=== 结果: ${pass} 通过, ${fail} 失败 ===`)
