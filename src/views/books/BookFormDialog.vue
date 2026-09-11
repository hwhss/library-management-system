<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createBook, updateBook } from '../../api/book.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  book: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  isbn: '',
  author: '',
  category: '其他',
  stock: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }]
}

const categories = ['文学', '科技', '历史', '艺术', '其他']

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

function resetForm() {
  if (props.book) {
    form.name = props.book.name
    form.isbn = props.book.isbn
    form.author = props.book.author
    form.category = props.book.category
    form.stock = props.book.stock
    form.description = props.book.description || ''
  } else {
    form.name = ''
    form.isbn = ''
    form.author = ''
    form.category = '其他'
    form.stock = 1
    form.description = ''
  }
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (props.book) {
      await updateBook(props.book.id, form)
      ElMessage.success('图书更新成功')
    } else {
      await createBook(form)
      ElMessage.success('图书新增成功')
    }
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="book ? '编辑图书' : '新增图书'"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="书名" prop="name">
        <el-input v-model="form.name" placeholder="请输入书名" />
      </el-form-item>
      <el-form-item label="ISBN" prop="isbn">
        <el-input v-model="form.isbn" placeholder="请输入ISBN" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="cat in categories"
            :key="cat"
            :label="cat"
            :value="cat"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" :precision="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入图书简介（选填）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ book ? '保存' : '新增' }}
      </el-button>
    </template>
  </el-dialog>
</template>
