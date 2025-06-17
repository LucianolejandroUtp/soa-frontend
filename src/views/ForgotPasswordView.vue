<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <!-- Logo/Header -->
      <div class="header">
        <h1 class="title">Recuperar Contraseña</h1>
        <p class="subtitle">
          Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu
          contraseña
        </p>
      </div>

      <!-- Form -->
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="rules"
        label-position="top"
        size="large"
        class="forgot-password-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Correo Electrónico" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            type="email"
            placeholder="tu@ejemplo.com"
            :prefix-icon="Message"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
            class="submit-btn"
          >
            {{ loading ? 'Enviando...' : 'Enviar Enlace' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Actions -->
      <div class="actions">
        <el-link @click="goToLogin" :underline="false" type="primary">
          <el-icon><ArrowLeft /></el-icon>
          Volver al Inicio de Sesión
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Message, ArrowLeft } from '@element-plus/icons-vue'

// Router
const router = useRouter()

// Form reference
const forgotPasswordFormRef = ref<FormInstance>()

// Loading state
const loading = ref(false)

// Form data
const forgotPasswordForm = reactive({
  email: '',
})

// Validation rules
const rules: FormRules = {
  email: [
    { required: true, message: 'El correo electrónico es requerido', trigger: 'blur' },
    { type: 'email', message: 'Por favor, ingresa un correo electrónico válido', trigger: 'blur' },
  ],
}

// Handle form submission
const handleSubmit = async () => {
  if (!forgotPasswordFormRef.value) return

  await forgotPasswordFormRef.value.validate((valid) => {
    if (valid) {
      sendResetEmail()
    }
  })
}

// Send reset email (mock implementation)
const sendResetEmail = async () => {
  loading.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    ElMessage.success({
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
      duration: 5000,
    })

    // Reset form
    forgotPasswordFormRef.value?.resetFields()

    // Optionally redirect to login after a delay
    setTimeout(() => {
      goToLogin()
    }, 3000)
  } catch {
    ElMessage.error('Error al enviar el enlace de recuperación. Inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}

// Navigation functions
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.forgot-password-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  z-index: 1;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  letter-spacing: -0.025em;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.forgot-password-form {
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.actions {
  text-align: center;
}

.actions .el-link {
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.actions .el-link:hover {
  transform: translateX(-2px);
}

/* Form styling improvements */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9ca3af;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Responsive design */
@media (max-width: 480px) {
  .forgot-password-container {
    padding: 16px;
  }

  .forgot-password-card {
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
