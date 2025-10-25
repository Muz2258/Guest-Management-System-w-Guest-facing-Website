<template>
  <div class="reset-password-container">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="reset-password-form"
    >
      <h2 class="form-title">Reset Password</h2>

      <el-alert
        v-if="authStore.error"
        :title="authStore.error"
        type="error"
        show-icon
        class="mb-4"
      />

      <el-form-item label="New Password" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="Enter your new password"
          :disabled="authStore.loading"
        />
      </el-form-item>

      <el-form-item label="Confirm Password" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          :disabled="authStore.loading"
          @keyup.enter="handleResetPassword(formRef)"
        />
      </el-form-item>

      <div class="form-actions">
        <el-button
          type="primary"
          :loading="authStore.loading"
          @click="handleResetPassword(formRef)"
        >
          Reset Password
        </el-button>

        <el-button
          type="text"
          :disabled="authStore.loading"
          @click="$router.push('/login')"
        >
          Back to Login
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElAlert } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const formRef = ref()
const rules = {
  newPassword: [
    { required: true, message: 'Please enter your new password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      required: true, 
      message: 'Please confirm your password', 
      trigger: 'blur',
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.value.newPassword) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      }
    }
  ]
}

const handleResetPassword = async (formEl: any) => {
  if (!formEl) return
  
  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      const success = await authStore.updatePassword(form.value.newPassword)
      if (success) {
        await router.push('/login')
      }
    }
  })
}
</script>

<style scoped>
.reset-password-form {
  min-width: 250px;
  max-width: 475px;
  width: 90vw;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--el-text-color-primary);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
