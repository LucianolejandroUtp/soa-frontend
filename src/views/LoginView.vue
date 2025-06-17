<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>Iniciar Sesión</h2>
        <p>Ingresa tus credenciales para acceder</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="loginForm.email"
            type="email"
            placeholder="Ingresa tu email"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="Contraseña" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Ingresa tu contraseña"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember"> Recordarme </el-checkbox>
            <el-link type="primary" :underline="false" @click="goToForgotPassword">
              ¿Olvidaste tu contraseña?
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            <span v-if="!loading">Iniciar Sesión</span>
            <span v-else>Iniciando sesión...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <el-divider>
          <span class="divider-text">¿No tienes cuenta?</span>
        </el-divider>
        <el-button type="default" size="large" style="width: 100%" @click="goToRegister">
          Crear cuenta nueva
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// Formulario reactivo
const loginForm = reactive({
  email: '',
  password: '',
  remember: false,
})

// Reglas de validación
const loginRules: FormRules = {
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Formato de email inválido', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
    { min: 6, message: 'La contraseña debe tener al menos 6 caracteres', trigger: 'blur' },
  ],
}

// Función de login
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Aquí iría la lógica de autenticación real
    ElMessage.success('¡Inicio de sesión exitoso!')

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    ElMessage.error('Error al iniciar sesión. Verifica tus credenciales.')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// Navegación
const goToRegister = () => {
  router.push('/register')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-container {
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

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  backdrop-filter: blur(10px);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-footer {
  margin-top: 20px;
}

.divider-text {
  color: #909399;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
    margin: 10px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}

/* Animaciones */
.login-box {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
