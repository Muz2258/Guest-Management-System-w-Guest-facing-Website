<template>
  <div class="forgot-password-container">
    <el-form
      ref="formRef"
      :model="resetPassRuleModel"
      :rules="resetPassFormRules"
      label-position="top"
      class="forgot-password-form"
    >
      <h2 class="form-title">Reset Password</h2>

      <p class="form-description">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <el-alert
        v-if="authStore.error"
        :title="authStore.error"
        type="error"
        show-icon
        class="mb-4"
      />

      <el-alert
        v-if="successMessage"
        :title="successMessage"
        type="success"
        show-icon
        class="mb-4"
      />

      <el-form-item label="Email" prop="email">
        <el-input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          :disabled="authStore.loading"
        />
      </el-form-item>

      <div class="form-actions">
        <el-button
          type="primary"
          :loading="authStore.loading"
          @click="handleResetPassword(formRef)"
        >
          Send Reset Instructions
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
import { computed, ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElAlert} from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const email = ref('')
const successMessage = ref('')

const formRef = ref<FormInstance>()

const validateEmail = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('Please enter your email'))
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value)) {
      callback(new Error('Please enter a valid email address'))
    } else {
      callback()
    }
  }
}

const resetPassRuleModel = ref({
  email: ''
})

const resetPassFormRules: FormRules = {
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ]
}

const handleResetPassword = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      const success = await authStore.resetPassword(email.value)
      if (success) {
        successMessage.value = 'Password reset instructions have been sent to your email'
        email.value = ''
      }
    }
  })
}
</script>

<style scoped>
.forgot-password-form {
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
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}

.form-description {
  text-align: center;
  color: var(--el-text-color-secondary);
  margin-bottom: 2rem;
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
