<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>Crear Cuenta</h2>
        <p>Completa los datos para registrarte</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        size="large"
        @submit.prevent="handleRegister"
      >
        <!-- Nombre y Apellido -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nombre" prop="firstName">
              <el-input v-model="registerForm.firstName" placeholder="Tu nombre" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Apellido" prop="lastName">
              <el-input v-model="registerForm.lastName" placeholder="Tu apellido" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- Email -->
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="tu@email.com"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <!-- Contraseña y Confirmar Contraseña -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Contraseña" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                :prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Confirmar Contraseña" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                :prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Términos y condiciones -->
        <el-form-item prop="acceptTerms">
          <el-checkbox v-model="registerForm.acceptTerms">
            Acepto los
            <el-link type="primary" :underline="false" @click="showTerms">
              términos y condiciones
            </el-link>
            y la
            <el-link type="primary" :underline="false" @click="showPrivacy">
              política de privacidad
            </el-link>
          </el-checkbox>
        </el-form-item>

        <!-- Botón de registro -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            <span v-if="!loading">Crear Cuenta</span>
            <span v-else>Creando cuenta...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <el-divider>
          <span class="divider-text">¿Ya tienes cuenta?</span>
        </el-divider>
        <el-button type="default" size="large" style="width: 100%" @click="goToLogin">
          Iniciar Sesión
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

// Formulario reactivo
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

// Validador personalizado para confirmar contraseña
const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value === '') {
    callback(new Error('Por favor confirma tu contraseña'))
  } else if (value !== registerForm.password) {
    callback(new Error('Las contraseñas no coinciden'))
  } else {
    callback()
  }
}

// Validador para términos y condiciones
const validateTerms = (_rule: unknown, value: boolean, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('Debes aceptar los términos y condiciones'))
  } else {
    callback()
  }
}

// Reglas de validación
const registerRules: FormRules = {
  firstName: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { min: 2, max: 50, message: 'El nombre debe tener entre 2 y 50 caracteres', trigger: 'blur' },
  ],
  lastName: [
    { required: true, message: 'El apellido es requerido', trigger: 'blur' },
    { min: 2, max: 50, message: 'El apellido debe tener entre 2 y 50 caracteres', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Formato de email inválido', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      trigger: 'blur',
    },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  acceptTerms: [{ validator: validateTerms, trigger: 'change' }],
}

// Función de registro
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Aquí iría la lógica de registro real
    ElMessage.success('¡Cuenta creada exitosamente!')

    // Redirigir al login
    router.push('/login')
  } catch (error) {
    ElMessage.error('Error al crear la cuenta. Inténtalo nuevamente.')
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}

// Navegación
const goToLogin = () => {
  router.push('/login')
}

// Mostrar términos y condiciones
const showTerms = () => {
  ElMessageBox.alert(
    'Aquí irían los términos y condiciones completos de la aplicación.',
    'Términos y Condiciones',
    { confirmButtonText: 'Entendido' },
  )
}

// Mostrar política de privacidad
const showPrivacy = () => {
  ElMessageBox.alert(
    'Aquí iría la política de privacidad completa de la aplicación.',
    'Política de Privacidad',
    { confirmButtonText: 'Entendido' },
  )
}
</script>

<style scoped>
.register-container {
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

.register-box {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  backdrop-filter: blur(10px);
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.register-footer {
  margin-top: 20px;
}

.divider-text {
  color: #909399;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .register-box {
    max-width: 400px;
    padding: 30px 20px;
    margin: 10px;
  }

  .register-header h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .register-box {
    padding: 20px 15px;
  }
}

/* Animaciones */
.register-box {
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
