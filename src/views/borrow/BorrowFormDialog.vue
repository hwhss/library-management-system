<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createBorrow, getAvailableBooks, getAvailableReaders } from '../../api/borrow.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  bookId: null,
  readerId: null,
  borrowDays: 30
})

const availableBooks = ref([])
const availableReaders = ref([])

const rules = {
  bookId: [{ required: true, message: '请选择图书', trigger: 'change' }],
  readerId: [{ required: true, message: '请选择读者', trigger: 'change' }],
  borrowDays: [{ required: true, message: '请输入借阅天数', trigger: 'blur' }]
}

watch(() => props.visible, async (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
    await loadOptions()
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

async function loadOptions() {
  try {
    const [b, r] = await Promise.all([getAvailableBooks(), getAvailableReaders()])
    availableBooks.value = b.data.list
    availableReaders.value = r.data.list
  } catch (error) {
    ElMessage.error('加载选项失败')
  }
}

function resetForm() {
  form.bookId = null
  form.readerId = null
  form.borrowDays = 30
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await createBorrow(form)
    ElMessage.success('借阅成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.message || '借阅失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增借阅"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="图书" prop="bookId">
        <el-select
          v-model="form.bookId"
          placeholder="请选择图书（仅显示库存>0的）"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="book in availableBooks"
            :key="book.id"
            :label="`${book.name}（库存：${book.stock}）`"
            :value="book.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="读者" prop="readerId">
        <el-select
          v-model="form.readerId"
          placeholder="请选择读者（仅显示状态正常的）"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="reader in availableReaders"
            :key="reader.id"
            :label="`${reader.name}（${reader.studentId}）`"
            :value="reader.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="借阅天数" prop="borrowDays">
        <el-input-number v-model="form.borrowDays" :min="1" :max="180" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认借阅</el-button>
    </template>
  </el-dialog>
</template>
