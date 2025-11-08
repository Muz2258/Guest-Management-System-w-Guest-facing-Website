<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? 'Edit Table' : 'Add New Table'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="Table Number" prop="table_number">
        <el-input v-model="form.table_number" placeholder="Enter table number" />
      </el-form-item>

      <el-form-item label="Table Name" prop="table_name">
        <el-input v-model="form.table_name" placeholder="Enter table name (optional)" />
      </el-form-item>

      <el-form-item label="Capacity" prop="capacity">
        <el-input-number v-model="form.capacity" :min="1" :max="20" />
      </el-form-item>

      <el-form-item label="Notes" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Add any notes about this table (optional)"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isEdit ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useSeatingStore } from '@/stores/seating'
import type { SeatingTable } from '@/types/seating'

const props = defineProps<{
  visible: boolean
  tableData?: SeatingTable
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const seatingStore = useSeatingStore()
const formRef = ref<FormInstance>()
const isSubmitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.tableData)

const form = ref({
  table_number: '',
  table_name: '',
  capacity: 8,
  notes: ''
})

const rules: FormRules = {
  table_number: [
    { required: true, message: 'Please enter table number', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: 'Please enter table capacity', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Capacity must be at least 1', trigger: 'blur' }
  ]
}

watch(() => props.tableData, (newVal) => {
  if (newVal) {
    form.value = {
      table_number: newVal.table_number,
      table_name: newVal.table_name || '',
      capacity: newVal.capacity,
      notes: newVal.notes || ''
    }
  }
}, { immediate: true })

const handleClose = () => {
  formRef.value?.resetFields()
  form.value = {
    table_number: '',
    table_name: '',
    capacity: 8,
    notes: ''
  }
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    isSubmitting.value = true

    const tableData = {
      table_number: form.value.table_number,
      table_name: form.value.table_name || undefined,
      capacity: form.value.capacity,
      notes: form.value.notes || undefined
    }

    if (isEdit.value && props.tableData) {
      await seatingStore.updateTable(props.tableData.table_id, tableData)
      ElMessage.success('Table updated successfully')
    } else {
      await seatingStore.createTable(tableData)
      ElMessage.success('Table created successfully')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Failed to save table:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
