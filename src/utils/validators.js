// 图书相关校验函数

/**
 * 检查 ISBN 是否唯一
 * @param {Array} books 所有图书
 * @param {String} isbn 要检查的ISBN
 * @param {Number} excludeId 排除的图书ID（编辑时排除自己）
 * @returns {Boolean} 是否唯一
 */
export function isIsbnUnique(books, isbn, excludeId = null) {
  return !books.some(book => book.isbn === isbn && book.id !== excludeId)
}

/**
 * 检查库存是否为非负整数
 * @param {Number} stock 库存数量
 * @returns {Boolean} 是否合法
 */
export function isValidStock(stock) {
  return Number.isInteger(stock) && stock >= 0
}

/**
 * 检查图书是否有未归还的借阅记录
 * @param {Number} bookId 图书ID
 * @param {Array} borrowRecords 借阅记录
 * @returns {Boolean} 是否有未归还记录
 */
export function hasOutstandingBorrow(bookId, borrowRecords) {
  return borrowRecords.some(record => 
    record.bookId === bookId && 
    (record.status === 'borrowing' || record.status === 'overdue')
  )
}

/**
 * 检查学号是否唯一
 * @param {Array} users 所有读者
 * @param {String} studentId 要检查的学号
 * @param {Number} excludeId 排除的读者ID
 * @returns {Boolean} 是否唯一
 */
export function isStudentIdUnique(users, studentId, excludeId = null) {
  return !users.some(user => user.studentId === studentId && user.id !== excludeId)
}

/**
 * 检查手机号是否唯一
 * @param {Array} users 所有读者
 * @param {String} phone 要检查的手机号
 * @param {Number} excludeId 排除的读者ID
 * @returns {Boolean} 是否唯一
 */
export function isPhoneUnique(users, phone, excludeId = null) {
  return !users.some(user => user.phone === phone && user.id !== excludeId)
}

/**
 * 校验手机号格式
 * @param {String} phone 手机号
 * @returns {Boolean} 是否合法
 */
export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}
