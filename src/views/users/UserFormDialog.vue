<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createReader, updateReader } from '../../api/user.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  reader: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  studentId: '',
  gender: '男',
  phone: '',
  password: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

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
  if (props.reader) {
    form.name = props.reader.name
    form.studentId = props.reader.studentId
    form.gender = props.reader.gender
    form.phone = props.reader.phone
    form.password = '' // 编辑时密码留空表示不修改
  } else {
    form.name = ''
    form.studentId = ''
    form.gender = '男'
    form.phone = ''
    form.password = ''
  }
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (props.reader) {
      await updateReader(props.reader.id, form)
      ElMessage.success('读者信息更新成功')
    } else {
      await createReader(form)
      ElMessage.success('读者新增成功')
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
    :title="reader ? '编辑读者' : '新增读者'"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="reader ? '留空表示不修改密码' : '请输入密码'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ reader ? '保存' : '新增' }}
      </el-button>
    </template>
  </el-dialog>
</template>
