const bookSeeds = [
  // 科技类（30本）
  ['JavaScript高级程序设计', 'Nicholas C. Zakas', '计算机', 5], ['Vue.js设计与实现', '霍春阳', '计算机', 4],
  ['深入浅出Node.js', '朴灵', '计算机', 3], ['Python编程：从入门到实践', 'Eric Matthes', '计算机', 6],
  ['深入理解计算机系统', 'Randal E. Bryant', '计算机', 3], ['算法导论', 'Thomas H. Cormen', '计算机', 4],
  ['操作系统导论', 'Remzi H. Arpaci-Dusseau', '计算机', 2], ['代码大全', 'Steve McConnell', '计算机', 5],
  ['重构：改善既有代码的设计', 'Martin Fowler', '计算机', 3], ['敏捷软件开发', 'Robert C. Martin', '计算机', 2],
  ['设计模式', 'GoF', '计算机', 4], ['深度学习', 'Ian Goodfellow', '人工智能', 3],
  ['机器学习', '周志华', '人工智能', 5], ['TensorFlow实战', '黄文坚', '人工智能', 2],
  ['PyTorch深度学习', '何宗倍', '人工智能', 3], ['统计学习方法', '李航', '人工智能', 4],
  ['神经网络与深度学习', '邱锡鹏', '人工智能', 2], ['自然语言处理入门', '何晗', '人工智能', 3],
  ['Web全栈开发', '阮一峰', '计算机', 4], ['数据库系统概念', 'Abraham Silberschatz', '计算机', 3],
  ['计算机网络', '谢希仁', '计算机', 5], ['编译原理', 'Alfred V. Aho', '计算机', 2],
  ['计算机组成原理', '唐朔飞', '计算机', 4], ['离散数学', '屈婉玲', '数学', 3],
  ['线性代数', '同济大学数学系', '数学', 6], ['概率论与数理统计', '盛骤', '数学', 5],
  ['高等数学（上册）', '同济大学数学系', '数学', 7], ['高等数学（下册）', '同济大学数学系', '数学', 6],
  ['统计学原理', '贾俊平', '数学', 3], ['数值分析', '李庆扬', '数学', 2],
  
  // 历史类（20本）
  ['人类简史', '尤瓦尔·赫拉利', '历史', 6], ['明朝那些事儿', '当年明月', '历史', 4],
  ['万历十五年', '黄仁宇', '历史', 2], ['全球通史', '斯塔夫里阿诺斯', '历史', 5],
  ['史记', '司马迁', '历史', 4], ['资治通鉴', '司马光', '历史', 3],
  ['中国通史', '吕思勉', '历史', 3], ['国史大纲', '钱穆', '历史', 2],
  ['剑桥中国史', '费正清', '历史', 4], ['枪炮、病菌与钢铁', '贾雷德·戴蒙德', '历史', 3],
  ['昨日的世界', '斯蒂芬·茨威格', '历史', 2], ['罗马人的故事', '盐野七生', '历史', 5],
  ['拜占庭帝国史', 'A.A.瓦西列夫', '历史', 2], ['欧洲中世纪史', '朱迪斯·M·本内特', '历史', 3],
  ['美国种族简史', '托马斯·索威尔', '历史', 2], ['希利尔讲世界史', 'H.E.希利尔', '历史', 4],
  ['中国近代史', '蒋廷黻', '历史', 3], ['邓小平时代', '傅高义', '历史', 2],
  ['丝绸之路', '彼得·弗兰科潘', '历史', 3], ['瓦尔登湖', '亨利·戴维·梭罗', '文学', 4],
  
  // 文学类（30本）
  ['百年孤独', '加西亚·马尔克斯', '文学', 5], ['活着', '余华', '文学', 7],
  ['围城', '钱钟书', '文学', 3], ['红楼梦', '曹雪芹', '文学', 8],
  ['小王子', '安托万·德·圣埃克苏佩里', '文学', 9], ['三国演义', '罗贯中', '文学', 8],
  ['水浒传', '施耐庵', '文学', 7], ['西游记', '吴承恩', '文学', 9],
  ['呐喊', '鲁迅', '文学', 5], ['彷徨', '鲁迅', '文学', 4],
  ['骆驼祥子', '老舍', '文学', 6], ['边城', '沈从文', '文学', 3],
  ['平凡的世界', '路遥', '文学', 7], ['白鹿原', '陈忠实', '文学', 5],
  ['黄金时代', '王小波', '文学', 4], ['沉默的大多数', '王小波', '文学', 3],
  ['三体', '刘慈欣', '文学', 6], ['球状闪电', '刘慈欣', '文学', 4],
  ['流浪地球', '刘慈欣', '文学', 5], ['AFK：荒原', '王靖康', '文学', 2],
  ['哈利波特与魔法石', 'J.K.罗琳', '文学', 8], ['哈利波特与密室', 'J.K.罗琳', '文学', 7],
  ['魔戒', 'J.R.R.托尔金', '文学', 5], ['霍比特人', 'J.R.R.托尔金', '文学', 4],
  ['安徒生童话', '安徒生', '儿童读物', 9], ['格林童话', '格林兄弟', '儿童读物', 8],
  ['伊索寓言', '伊索', '儿童读物', 7], ['一千零一夜', '佚名', '文学', 6],
  ['茶馆', '老舍', '文学', 3], ['雷雨', '曹禺', '文学', 2],
  
  // 艺术类（10本）
  ['艺术的故事', 'E. H. 贡布里希', '艺术', 2], ['美的历程', '李泽厚', '艺术', 4],
  ['梵高传', '欧文·斯通', '艺术', 3], ['设计中的设计', '原研哉', '艺术', 2],
  ['世界美术名作二十讲', '傅雷', '艺术', 3], ['中国美术史', '王伯敏', '艺术', 2],
  ['写给大家的西方美术史', '蒋勋', '艺术', 4], ['写给大家的中国美术史', '蒋勋', '艺术', 3],
  ['艺术哲学', '丹纳', '艺术', 2], ['现代艺术150年', '威尔·贡培兹', '艺术', 3],
  
  // 哲学/其他（10本）
  ['山海经', '佚名', '国学', 3], ['中国哲学简史', '冯友兰', '哲学', 4],
  ['时间简史', '史蒂芬·霍金', '科普', 2], ['毛泽东选集', '毛泽东', '国学', 10],
  ['论语译注', '杨伯峻', '国学', 6], ['道德经', '老子', '国学', 5],
  ['庄子', '庄周', '国学', 3], ['苏菲的世界', '乔斯坦·贾德', '哲学', 4],
  ['理想国', '柏拉图', '哲学', 2], ['君主论', '马基雅维利', '哲学', 3]
]

const readerSeeds = [
  ['张三', '男', '13800138001', '2026-01-15', 'normal'], ['李四', '女', '13800138002', '2026-01-18', 'normal'],
  ['王五', '男', '13800138003', '2026-02-03', 'normal'], ['赵六', '女', '13800138004', '2026-02-11', 'disabled'],
  ['钱七', '男', '13800138005', '2026-02-22', 'normal'], ['孙八', '女', '13800138006', '2026-03-02', 'normal'],
  ['周九', '男', '13800138007', '2026-03-15', 'normal'], ['吴十', '女', '13800138008', '2026-04-06', 'normal'],
  ['郑十一', '男', '13800138009', '2026-04-20', 'disabled'], ['王小雨', '女', '13800138010', '2026-05-08', 'normal'],
  ['陈晨', '男', '13800138011', '2026-05-17', 'normal'], ['刘欣', '女', '13800138012', '2026-06-01', 'normal'],
  ['杨帆', '男', '13800138013', '2026-06-19', 'normal'], ['黄莉', '女', '13800138014', '2026-07-04', 'normal'],
  ['徐明', '男', '13800138015', '2026-08-12', 'normal'], ['林小红', '女', '13800138016', '2026-08-20', 'normal'],
  ['何伟', '男', '13800138017', '2026-09-01', 'normal'], ['郭静', '女', '13800138018', '2026-09-10', 'disabled'],
  ['马晓东', '男', '13800138019', '2026-09-15', 'normal'], ['罗小雪', '女', '13800138020', '2026-09-22', 'normal'],
  ['梁浩', '男', '13800138021', '2026-10-05', 'normal'], ['宋佳', '女', '13800138022', '2026-10-12', 'normal'],
  ['唐磊', '男', '13800138023', '2026-10-20', 'normal'], ['韩梅梅', '女', '13800138024', '2026-11-01', 'normal'],
  ['冯远征', '男', '13800138025', '2026-11-08', 'disabled'], ['董文文', '女', '13800138026', '2026-11-15', 'normal'],
  ['萧亚轩', '女', '13800138027', '2026-11-22', 'normal'], ['程强', '男', '13800138028', '2026-12-01', 'normal'],
  ['曹阳', '男', '13800138029', '2026-12-10', 'normal'], ['袁莉', '女', '13800138030', '2026-12-18', 'normal']
]

const books = bookSeeds.map(([name, author, category, stock], index) => ({
  id: index + 1,
  isbn: `9787111${String(123456 + index).padStart(6, '0')}`,
  name,
  author,
  category,
  stock,
  description: `${name}是一本值得阅读的${category}类图书。`,
  cover: `https://picsum.photos/seed/library-book-${index + 1}/80/100`,
  createdAt: index < 6 ? `2026-09-${String(index + 1).padStart(2, '0')}` : `2026-0${Math.floor(index / 3) + 1}-15`
}))

const users = readerSeeds.map(([name, gender, phone, registerTime, status], index) => ({
  id: index + 1,
  name,
  studentId: `2023${String(index + 1).padStart(3, '0')}`,
  gender,
  phone,
  password: '123456',
  registerTime,
  status,
  avatar: `https://picsum.photos/seed/library-reader-${index + 1}/80/80`
}))

// 生成借阅记录：前5本是热门书，借阅次数依次递减
// 月份分布：2026-04 到 2026-09
const bookBorrowCounts = [12, 10, 9, 8, 7, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2] // 前15本的借阅次数
const monthDistribution = [
  { month: '2026-04', count: 8 },
  { month: '2026-05', count: 12 },
  { month: '2026-06', count: 10 },
  { month: '2026-07', count: 15 },
  { month: '2026-08', count: 18 },
  { month: '2026-09', count: 17 }
]

const borrowRecords = []
let recordId = 1

// 生成热门图书的借阅记录
for (let bookIdx = 0; bookIdx < bookBorrowCounts.length; bookIdx++) {
  const count = bookBorrowCounts[bookIdx]
  const book = books[bookIdx]
  
  for (let i = 0; i < count; i++) {
    // 随机分配月份
    const monthData = monthDistribution[Math.floor(Math.random() * monthDistribution.length)]
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const borrowDate = `${monthData.month}-${day}`
    
    // 还书日期 = 借阅日期 + 30天（简化处理）
    const dueDay = String(Math.min(parseInt(day) + 30, 30)).padStart(2, '0')
    const dueDate = `${monthData.month}-${dueDay}`
    
    // 状态随机
    const statuses = ['borrowing', 'overdue', 'returned', 'overdue_returned']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const returned = status === 'returned' || status === 'overdue_returned'
    
    const reader = users[Math.floor(Math.random() * users.length)]
    
    borrowRecords.push({
      id: recordId++,
      bookId: book.id,
      bookName: book.name,
      readerId: reader.id,
      readerName: reader.name,
      borrowDate,
      dueDate,
      returnDate: returned ? dueDate : null,
      status
    })
  }
}

// 再随机生成一些其他图书的借阅记录
for (let i = 0; i < 30; i++) {
  const bookIdx = Math.floor(Math.random() * (books.length - 15)) + 15
  const book = books[bookIdx]
  const monthData = monthDistribution[Math.floor(Math.random() * monthDistribution.length)]
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  const borrowDate = `${monthData.month}-${day}`
  const dueDay = String(Math.min(parseInt(day) + 30, 30)).padStart(2, '0')
  const dueDate = `${monthData.month}-${dueDay}`
  const statuses = ['borrowing', 'overdue', 'returned', 'overdue_returned']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const returned = status === 'returned' || status === 'overdue_returned'
  const reader = users[Math.floor(Math.random() * users.length)]
  
  borrowRecords.push({
    id: recordId++,
    bookId: book.id,
    bookName: book.name,
    readerId: reader.id,
    readerName: reader.name,
    borrowDate,
    dueDate,
    returnDate: returned ? dueDate : null,
    status
  })
}

export const initialLibraryData = Object.freeze({
  books: Object.freeze(books),
  users: Object.freeze(users),
  borrowRecords: Object.freeze(borrowRecords)
})
