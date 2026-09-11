import axios from 'axios'
import { getLibraryData, saveLibraryData } from './libraryStorage.js'
import { isIsbnUnique, isValidStock, hasOutstandingBorrow, isStudentIdUnique, isPhoneUnique, isValidPhone } from './validators.js'
import { getTodayString, calculateDueDate, refreshBorrowStatuses } from './borrowRules.js'

function success(config, data) {
  return Promise.resolve({
    config,
    data: { code: 200, message: '操作成功', data },
    headers: {},
    status: 200,
    statusText: 'OK'
  })
}

function fail(config, message, status = 400) {
  return Promise.reject({
    config,
    response: {
      data: { code: status, message },
      status,
      statusText: 'Bad Request'
    },
    message
  })
}

function routeRequest(config) {
  const path = `${config.baseURL ?? ''}${config.url ?? ''}`.replace(/\/{2,}/g, '/')
  const method = config.method?.toLowerCase()
  const data = getLibraryData()

  // ========== 图书接口 ==========
  
  // GET /api/books - 图书列表（支持搜索、筛选、分页）
  if (method === 'get' && path === '/api/books') {
    const params = config.params || {}
    let result = [...data.books]

    // 名称模糊搜索
    if (params.name) {
      result = result.filter(book => book.name.includes(params.name))
    }

    // 分类筛选
    if (params.category) {
      result = result.filter(book => book.category === params.category)
    }

    // 排序：按ID倒序
    result.sort((a, b) => b.id - a.id)

    // 分页
    const total = result.length
    const page = Number(params.page) || 1
    const pageSize = Number(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const pageData = result.slice(start, start + pageSize)

    return success(config, { list: pageData, total })
  }

  // POST /api/books - 新增图书
  if (method === 'post' && path === '/api/books') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const books = data.books

    // 校验ISBN唯一
    if (!isIsbnUnique(books, payload.isbn)) {
      return fail(config, '该ISBN已存在')
    }

    // 校验库存
    if (!isValidStock(payload.stock)) {
      return fail(config, '库存必须为非负整数')
    }

    // 生成新图书
    const newId = Math.max(...books.map(b => b.id), 0) + 1
    const today = new Date().toISOString().split('T')[0]
    const newBook = {
      id: newId,
      isbn: payload.isbn,
      name: payload.name,
      author: payload.author,
      category: payload.category || '其他',
      stock: Number(payload.stock),
      description: payload.description || '',
      cover: payload.cover || `https://picsum.photos/seed/book-${newId}/80/100`,
      createdAt: today
    }

    books.push(newBook)
    saveLibraryData(data)
    return success(config, newBook)
  }

  // PUT /api/books/:id - 编辑图书
  if (method === 'put' && path.startsWith('/api/books/')) {
    const id = Number(path.split('/').pop())
    const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const books = data.books
    const bookIndex = books.findIndex(b => b.id === id)

    if (bookIndex === -1) {
      return fail(config, '图书不存在', 404)
    }

    // 校验ISBN唯一（排除自己）
    if (!isIsbnUnique(books, payload.isbn, id)) {
      return fail(config, '该ISBN已存在')
    }

    // 校验库存
    if (!isValidStock(payload.stock)) {
      return fail(config, '库存必须为非负整数')
    }

    // 更新图书
    books[bookIndex] = {
      ...books[bookIndex],
      isbn: payload.isbn,
      name: payload.name,
      author: payload.author,
      category: payload.category || '其他',
      stock: Number(payload.stock),
      description: payload.description || ''
    }

    saveLibraryData(data)
    return success(config, books[bookIndex])
  }

  // DELETE /api/books/:id - 删除图书
  if (method === 'delete' && path.startsWith('/api/books/')) {
    const id = Number(path.split('/').pop())
    const books = data.books
    const bookIndex = books.findIndex(b => b.id === id)

    if (bookIndex === -1) {
      return fail(config, '图书不存在', 404)
    }

    // 检查是否有未归还借阅
    if (hasOutstandingBorrow(id, data.borrowRecords)) {
      return fail(config, '该图书存在未归还的借阅，无法删除')
    }

    // 删除图书（保留借阅历史记录）
    books.splice(bookIndex, 1)
    saveLibraryData(data)
    return success(config, { id })
  }

  // ========== 读者接口 ==========
  
  // GET /api/users - 读者列表
  if (method === 'get' && path === '/api/users') {
    const params = config.params || {}
    let result = [...data.users]

    // 姓名/学号模糊搜索
    if (params.keyword) {
      result = result.filter(user => 
        user.name.includes(params.keyword) || 
        user.studentId.includes(params.keyword)
      )
    }

    result.sort((a, b) => b.id - a.id)
    const total = result.length
    const page = Number(params.page) || 1
    const pageSize = Number(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const pageData = result.slice(start, start + pageSize)

    return success(config, { list: pageData, total })
  }

  // POST /api/users - 新增读者
  if (method === 'post' && path === '/api/users') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const users = data.users

    // 校验密码必填
    if (!payload.password) {
      return fail(config, '密码不能为空')
    }

    // 校验学号唯一
    if (!isStudentIdUnique(users, payload.studentId)) {
      return fail(config, '该学号已存在')
    }

    // 校验手机号唯一
    if (!isPhoneUnique(users, payload.phone)) {
      return fail(config, '该手机号已存在')
    }

    // 校验手机号格式
    if (!isValidPhone(payload.phone)) {
      return fail(config, '手机号格式不正确')
    }

    // 生成新读者
    const newId = Math.max(...users.map(u => u.id), 0) + 1
    const today = new Date().toISOString().split('T')[0]
    const newUser = {
      id: newId,
      name: payload.name,
      studentId: payload.studentId,
      gender: payload.gender || '男',
      phone: payload.phone,
      password: payload.password,
      registerTime: today,
      status: 'normal',
      avatar: `https://picsum.photos/seed/user-${newId}/80/80`
    }

    users.push(newUser)
    saveLibraryData(data)
    return success(config, newUser)
  }

  // PUT /api/users/:id - 编辑读者
  if (method === 'put' && path.startsWith('/api/users/') && !path.endsWith('/status')) {
    const id = Number(path.split('/').pop())
    const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const users = data.users
    const userIndex = users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return fail(config, '读者不存在', 404)
    }

    // 校验学号唯一（排除自己）
    if (!isStudentIdUnique(users, payload.studentId, id)) {
      return fail(config, '该学号已存在')
    }

    // 校验手机号唯一（排除自己）
    if (!isPhoneUnique(users, payload.phone, id)) {
      return fail(config, '该手机号已存在')
    }

    // 校验手机号格式
    if (!isValidPhone(payload.phone)) {
      return fail(config, '手机号格式不正确')
    }

    // 更新读者（密码为空则不更新）
    const updateData = { ...payload }
    if (!updateData.password) {
      delete updateData.password
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData
    }

    saveLibraryData(data)
    return success(config, users[userIndex])
  }

  // PATCH /api/users/:id/status - 切换读者状态
  if (method === 'patch' && path.startsWith('/api/users/') && path.endsWith('/status')) {
    const id = Number(path.split('/')[3])
    const users = data.users
    const userIndex = users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return fail(config, '读者不存在', 404)
    }

    // 切换状态
    users[userIndex].status = users[userIndex].status === 'normal' ? 'disabled' : 'normal'

    saveLibraryData(data)
    return success(config, users[userIndex])
  }

  // ========== 借阅接口 ==========
  
  // GET /api/borrow - 借阅记录列表
  if (method === 'get' && path === '/api/borrow') {
    const params = config.params || {}
    // 先刷新所有记录的状态
    let result = refreshBorrowStatuses(data.borrowRecords)

    // 状态筛选
    if (params.status) {
      result = result.filter(record => record.status === params.status)
    }

    result.sort((a, b) => b.id - a.id)
    const total = result.length
    const page = Number(params.page) || 1
    const pageSize = Number(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const pageData = result.slice(start, start + pageSize)

    return success(config, { list: pageData, total })
  }

  // POST /api/borrow - 新增借阅（借书）
  if (method === 'post' && path === '/api/borrow') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const books = data.books
    const users = data.users
    const records = data.borrowRecords

    // 校验图书存在且库存>0
    const book = books.find(b => b.id === payload.bookId)
    if (!book) {
      return fail(config, '图书不存在')
    }
    if (book.stock <= 0) {
      return fail(config, '该图书库存不足，无法借阅')
    }

    // 校验读者存在且状态正常
    const reader = users.find(u => u.id === payload.readerId)
    if (!reader) {
      return fail(config, '读者不存在')
    }
    if (reader.status !== 'normal') {
      return fail(config, '该读者已被禁用，无法借阅')
    }

    // 计算应还日期
    const today = getTodayString()
    const borrowDays = Number(payload.borrowDays) || 30
    const dueDate = calculateDueDate(today, borrowDays)

    // 生成新借阅记录
    const newId = Math.max(...records.map(r => r.id), 0) + 1
    const newRecord = {
      id: newId,
      bookId: payload.bookId,
      bookName: book.name,
      readerId: payload.readerId,
      readerName: reader.name,
      borrowDate: today,
      dueDate: dueDate,
      returnDate: null,
      status: 'borrowing'
    }

    // 库存减1
    book.stock -= 1

    records.push(newRecord)
    saveLibraryData(data)
    return success(config, newRecord)
  }

  // PUT /api/borrow/:id/return - 还书
  if (method === 'put' && path.startsWith('/api/borrow/') && path.endsWith('/return')) {
    const id = Number(path.split('/')[3])
    const records = data.borrowRecords
    const recordIndex = records.findIndex(r => r.id === id)

    if (recordIndex === -1) {
      return fail(config, '借阅记录不存在', 404)
    }

    const record = records[recordIndex]
    if (record.returnDate) {
      return fail(config, '该记录已归还，不能重复还书')
    }

    // 更新归还状态
    const today = getTodayString()
    const isOverdue = today > record.dueDate
    record.returnDate = today
    record.status = isOverdue ? 'overdue_returned' : 'returned'

    // 图书库存加1
    const book = data.books.find(b => b.id === record.bookId)
    if (book) {
      book.stock += 1
    }

    saveLibraryData(data)
    return success(config, record)
  }

  return Promise.reject(new Error(`未找到 Mock 接口：${method?.toUpperCase()} ${path}`))
}

const request = axios.create({
  baseURL: '/api',
  adapter: routeRequest
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('library_auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default request
