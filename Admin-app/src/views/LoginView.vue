<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElForm, ElFormItem, ElInput, ElButton, ElAlert, ElContainer } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const { loading } = storeToRefs(authStore)

const loginForm = ref({
  email: '',
  password: ''
})

const formRef = ref<FormInstance>()

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await authStore.login(loginForm.value.email, loginForm.value.password)
}

const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <el-form
    ref="formRef"
    label-position="top"
    class="login-form"
  >
    <h2 class="form-title">Back-office Login</h2>

    <el-alert
      v-if="authStore.error"
      :title="authStore.error"
      type="error"
      show-icon
      class="mb-4"
    />

    <el-form-item label="Email" prop="email">
      <el-input
        v-model="loginForm.email"
        type="email"
        placeholder="Enter your email"
        :disabled="authStore.loading"
      />
    </el-form-item>

    <el-form-item label="Password" prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="Enter your password"
        :disabled="authStore.loading"
        @keyup.enter="handleLogin(formRef)"
      />
    </el-form-item>

    <div class="form-actions">
      <el-button
        type="primary"
        :loading="authStore.loading"
        @click="handleLogin(formRef)"
        :disabled="loginForm.email === '' || loginForm.password === ''"
      >
        Login
      </el-button>

      <el-button
        type="text"
        :disabled="authStore.loading"
        @click="handleForgotPassword"
      >
        Forgot Password?
      </el-button>
    </div>
  </el-form>
</template>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
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
