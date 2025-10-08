<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? 'Edit Guest' : 'Add New Guest'"
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
      <div class="form-item-group">
        <el-form-item label="Title(s)" prop="name.titles" >
          <el-input-tag v-model="form.name.titles" placeholder="Enter guest title(s)" />
        </el-form-item>

        <el-form-item label="First name" prop="name.first_name">
          <el-input v-model="form.name.first_name" placeholder="Enter guest first name" />
        </el-form-item>

        <el-form-item label="Middle name" prop="name.middle_name">
          <el-input v-model="form.name.middle_name" placeholder="Enter guest middle name" />
        </el-form-item>

        <el-form-item label="Last name" prop="name.last_name">
          <el-input v-model="form.name.last_name" placeholder="Enter guest last name" />
        </el-form-item>

        <el-form-item label="Suffix(es)" prop="name.suffixes">
          <el-input-tag v-model="form.name.suffixes" placeholder="Enter guest suffix(es)" />
        </el-form-item>
      </div>

      <el-form-item label="Family" prop="family_side">
        <el-select v-model="form.family_side" placeholder="Select family side">
          <el-option label="Bride" value="bride" />
          <el-option label="Groom" value="groom" />
          <el-option label="Both" value="both" />
        </el-select>
      </el-form-item>

      <el-form-item label="Guest Type" prop="guest_type">
        <el-select v-model="form.guest_type" placeholder="Select guest type">
          <el-option label="Single" value="single" />
          <el-option label="Couple" value="couple" />
        </el-select>
      </el-form-item>

      <el-form-item label="Category" prop="guest_category">
        <el-select v-model="form.guest_category" placeholder="Select category">
          <el-option label="Family" value="family" />
          <el-option label="Friend" value="friend" />
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

      <el-form-item v-if="form.plus_one_eligibility === 'eligible'" label="Max. Plus Ones" prop="plus_one_limit">
        <el-input
          type="number"
          min="0"
          max="3"
          v-model.number="form.plus_one_limit"
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
          <el-option label="Physical Card" value="physical_qr" />
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
import { ref, reactive, defineEmits, defineProps, computed, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Guest, GuestTableRow } from '@/types/guest'

const props = defineProps<{
  modelValue: boolean
  initialData: GuestTableRow | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', value: Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'>): void
}>()

const isEdit = computed(() => !!props.initialData?.guest_id)
const loading = ref(props.loading)
const formRef = ref<FormInstance>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const form = reactive<Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'>>({
  guest_type: 'single',
  name: {
    titles: [],
    first_name: '',
    middle_name: '',
    last_name: '',
    suffixes: []
  },
  guest_category: 'friend',
  plus_one_eligibility: 'not_eligible',
  invitation_type: 'rsvp_guest',
  invitation_method: 'digital',
  plus_one_limit: 0,
  family_side: 'both'
})

const rules: FormRules = {
  guest_type: [{ required: true, message: 'Please select guest type', trigger: 'change' }],
  'name.first_name': [{ required: true, message: 'Please enter guest first name', trigger: 'blur' }],
  guest_category: [{ required: true, message: 'Please select category', trigger: 'change' }],
  invitation_type: [{ required: true, message: 'Please select invitation type', trigger: 'change' }],
  invitation_method: [{ required: true, message: 'Please select invitation method', trigger: 'change' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      console.log('📝 Form submission data:', form)
      emit('submit', { ...form })
    } else {
      console.warn('Form validation failed:', fields)
    }
  })
}

// Reset form when dialog is closed
const handleClose = () => {
  emit('update:modelValue', false)
  loading.value = false
  formRef.value?.resetFields()
}

// Watch for changes in initialData and update form
onMounted(() => {
  if (props.initialData) {
      form.guest_type = props.initialData.guest_type
      form.name = props.initialData.name
      form.guest_category = props.initialData.guest_category
      form.plus_one_eligibility = props.initialData.plus_one_eligibility
      form.invitation_type = props.initialData.invitation_type
      form.invitation_method = props.initialData.invitation_method
      form.family_side = props.initialData.family_side
      form.plus_one_limit = props.initialData.plus_one_limit ?? 0
      console.log('📝 Form updated with new data:', form)
  } else {
      // Reset form to defaults
      form.guest_type = 'single'
      form.name = {
        titles: [],
        first_name: '',
        middle_name: '',
        last_name: '',
        suffixes: []
      },
      form.guest_category = 'friend'
      form.plus_one_eligibility = 'not_eligible'
      form.invitation_type = 'rsvp_guest'
      form.invitation_method = 'digital'
      form.family_side = 'both'
      form.plus_one_limit = 0
      console.log('📝 Form reset to defaults')
  }
})

// Watch for dialog opening
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    console.log('📝 Dialog opened with initial data:', props.initialData)
    if (props.initialData) {
      // Pre-populate form with guest data
      Object.assign(form, {
        guest_type: props.initialData.guest_type,
        name: props.initialData.name,
        guest_category: props.initialData.guest_category,
        plus_one_eligibility: props.initialData.plus_one_eligibility,
        invitation_type: props.initialData.invitation_type,
        invitation_method: props.initialData.invitation_method,
        family_side: props.initialData.family_side,
        plus_one_limit: props.initialData.plus_one_limit ?? 0
      })
      console.log('📝 Form populated with guest data:', form)
    } else {
      // Reset form to defaults for new guest
      Object.assign(form, {
        guest_type: 'single',
        name: {
          titles: [],
          first_name: '',
          middle_name: '',
          last_name: '',
          suffixes: []
        },
        guest_category: 'friend',
        plus_one_eligibility: 'not_eligible',
        invitation_type: 'rsvp_guest',
        invitation_method: 'digital',
        family_side: 'both',
        plus_one_limit: 0
      })
      console.log('📝 Form reset for new guest')
    }
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-item-group {
  padding-bottom: 24px;
}
</style>
