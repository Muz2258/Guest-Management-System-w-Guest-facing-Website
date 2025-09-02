<template>
  <el-dialog
    :title="isEdit ? 'Edit Guest' : 'Add New Guest'"
    v-model="dialogVisible"
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
      <el-form-item label="Guest Type" prop="guest_type">
        <el-select v-model="form.guest_type" placeholder="Select guest type">
          <el-option label="Single" value="single" />
          <el-option label="Couple" value="couple" />
        </el-select>
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" placeholder="Enter guest name" />
      </el-form-item>

      <el-form-item label="Phone" prop="phone">
        <el-input v-model="form.phone" placeholder="+234">
          <template #prepend>+234</template>
        </el-input>
      </el-form-item>

      <el-form-item label="Category" prop="guest_category">
        <el-select v-model="form.guest_category" placeholder="Select category">
          <el-option label="Family" value="family" />
          <el-option label="Friends" value="friends" />
          <el-option label="Asoebi" value="asoebi" />
          <el-option label="Best Man" value="bestman" />
          <el-option label="Chief Bridesmaid" value="chiefbridesmaid" />
        </el-select>
      </el-form-item>

      <el-form-item label="Plus One Eligible" prop="plus_one_eligibility">
        <el-switch
          :model-value="form.plus_one_eligibility === 'eligible'"
          @update:model-value="(val) => form.plus_one_eligibility = val ? 'eligible' : 'not_eligible'"
        />
      </el-form-item>

      <el-form-item label="Invitation Type" prop="invitation_type">
        <el-select v-model="form.invitation_type" placeholder="Select invitation type">
          <el-option label="RSVP" value="rsvp_guest" />
          <el-option label="Info Only" value="information_only" />
        </el-select>
      </el-form-item>

      <el-form-item label="Invitation Method" prop="invitation_method">
        <el-select v-model="form.invitation_method" placeholder="Select invitation method">
          <el-option label="Digital" value="digital" />
          <el-option label="Physical QR" value="physical_qr" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits, defineProps, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Guest } from '@/types/guest'

const props = defineProps<{
  modelValue: boolean
  initialData?: Partial<Guest>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', value: Omit<Guest, 'guest_id' | 'auth_token' | 'created_by'>): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.initialData?.guest_id)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Omit<Guest, 'guest_id' | 'auth_token' | 'created_by'>>({
    guest_type: props.initialData?.guest_type ?? 'single',
    name: props.initialData?.name ?? '',
    phone: props.initialData?.phone ?? '',
    guest_category: props.initialData?.guest_category ?? 'friend',
    plus_one_eligibility: props.initialData?.plus_one_eligibility ?? 'not_eligible',
    invitation_type: props.initialData?.invitation_type ?? 'rsvp_guest',
    invitation_method: props.initialData?.invitation_method ?? 'digital',
})

const rules: FormRules = {
  guest_type: [{ required: true, message: 'Please select guest type', trigger: 'change' }],
  name: [{ required: true, message: 'Please enter guest name', trigger: 'blur' }],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number', trigger: 'blur' }
  ],
  guest_category: [{ required: true, message: 'Please select category', trigger: 'change' }],
  invitation_type: [{ required: true, message: 'Please select invitation type', trigger: 'change' }],
  invitation_method: [{ required: true, message: 'Please select invitation method', trigger: 'change' }]
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
        emit('submit', { ...form })
    } else {
      console.warn('Form validation failed:', fields)
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
