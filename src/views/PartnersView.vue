<template>
  <div class="partners-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Gestión de Partners</h1>
      <div style="display: flex; gap: 10px;">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"> Nuevo Partner </el-button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-input
            v-model="filters.search"
            placeholder="Buscar partners..."
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-input
            v-model="filters.email"
            placeholder="Buscar por email"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.isActive" placeholder="Estado" clearable>
            <el-option label="Todos" :value="undefined" />
            <el-option label="Activos" :value="true" />
            <el-option label="Inactivos" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="tokenSearch"
            placeholder="Buscar por token..."
            :prefix-icon="Key"
            clearable
            @change="searchByToken"
          />
        </el-col>
        <el-col :span="4">
          <el-button @click="clearFilters">Limpiar</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tabla de partners -->
    <el-card>
      <el-table
        :data="filteredPartners"
        style="width: 100%"
        v-loading="loading"
        empty-text="No hay partners disponibles"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="Partner" width="300">
          <template #default="scope">
            <div class="partner-info">
              <div class="partner-name">{{ scope.row.name }} {{ scope.row.lastname }}</div>
              <div class="partner-email">{{ scope.row.email }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Token" width="200">
          <template #default="scope">
            <div class="token-info">
              <el-tooltip :content="scope.row.token" placement="top">
                <span class="token-display">{{ maskToken(scope.row.token) }}</span>
              </el-tooltip>
              <el-button
                type="text"
                :icon="CopyDocument"
                size="small"
                @click="copyToken(scope.row.token)"
                class="copy-token-btn"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Creación" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="320" fixed="right">
          <template #default="scope">
            <el-tooltip content="Editar partner" placement="top">
              <el-button type="primary" size="small" :icon="Edit" @click="editPartner(scope.row)" />
            </el-tooltip>

            <el-tooltip content="Cambiar contraseña" placement="top">
              <el-button type="warning" size="small" :icon="Lock" @click="openPasswordDialog(scope.row)" />
            </el-tooltip>

            <el-tooltip
              :content="scope.row.isActive ? 'Desactivar partner' : 'Activar partner'"
              placement="top"
            >
              <el-button
                :type="scope.row.isActive ? 'warning' : 'success'"
                size="small"
                :icon="scope.row.isActive ? CloseBold : Check"
                @click="togglePartnerStatus(scope.row)"
              />
            </el-tooltip>

            <el-tooltip content="Eliminar partner" placement="top">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="deletePartner(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalPartners"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Dialog para crear/editar partner -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Editar Partner' : 'Crear Nuevo Partner'"
      width="600"
      @close="resetForm"
    >
      <el-form
        ref="partnerFormRef"
        :model="partnerForm"
        :rules="partnerRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Nombre" prop="name">
          <el-input
            v-model="partnerForm.name"
            placeholder="Ingrese el nombre"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Apellido" prop="lastname">
          <el-input
            v-model="partnerForm.lastname"
            placeholder="Ingrese el apellido"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="partnerForm.email"
            type="email"
            placeholder="Ingrese el email"
            maxlength="100"
          />
        </el-form-item>

        <el-form-item v-if="!isEditing" label="Contraseña" prop="password">
          <el-input
            v-model="partnerForm.password"
            type="password"
            placeholder="Ingrese la contraseña"
            show-password
            maxlength="100"
          />
        </el-form-item>

        <el-form-item v-if="isEditing" label="Token" prop="token">
          <el-input
            v-model="partnerForm.token"
            placeholder="Token del partner"
            readonly
            disabled
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="savePartner" :loading="loading">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog para cambiar contraseña -->
    <el-dialog
      v-model="showPasswordDialog"
      title="Cambiar Contraseña"
      width="400"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Partner">
          <span>{{ selectedPartner?.name }} {{ selectedPartner?.lastname }}</span>
        </el-form-item>

        <el-form-item label="Nueva Contraseña" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="Ingrese la nueva contraseña"
            show-password
            maxlength="100"
          />
        </el-form-item>

        <el-form-item label="Confirmar" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="Confirme la contraseña"
            show-password
            maxlength="100"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPasswordDialog = false">Cancelar</el-button>
          <el-button type="primary" @click="updatePassword" :loading="loading">
            Actualizar Contraseña
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Check,
  CloseBold,
  Lock,
  Key,
  CopyDocument,
} from '@element-plus/icons-vue'
import { PartnerService } from '@/services/partnerService'
import { useFilters } from '@/composables/useFilters'
import type { Partner, CreatePartnerDto, UpdatePartnerDto, UpdatePasswordPartnerDto } from '@/types/api'

// Referencias
const partnerFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// Estados reactivos
const partners = ref<Partner[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showPasswordDialog = ref(false)
const isEditing = ref(false)
const selectedPartner = ref<Partner | null>(null)
const tokenSearch = ref('')

// Composable de filtros
const { filters, clearFilters, filterArrayLocally } = useFilters<{
  search: string
  email: string
  isActive: boolean | undefined
}>({
  storageKey: 'partners-filters',
  debounceMs: 300,
  initialFilters: {
    search: '',
    email: '',
    isActive: undefined,
  },
})

// Variables de paginación
const currentPage = ref(1)
const pageSize = ref(10)
const totalPartners = ref(0)

// Formulario para crear/editar partner
const partnerForm = reactive({
  id: 0,
  name: '',
  lastname: '',
  email: '',
  password: '',
  token: '',
})

// Formulario para cambiar contraseña
const passwordForm = reactive({
  password: '',
  confirmPassword: '',
})

// Reglas de validación para partner
const partnerRules: FormRules = reactive({
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres', trigger: 'blur' },
  ],
  lastname: [
    { required: true, message: 'El apellido es requerido', trigger: 'blur' },
    { min: 2, message: 'El apellido debe tener al menos 2 caracteres', trigger: 'blur' },
    { max: 50, message: 'El apellido no puede exceder 50 caracteres', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'El email es requerido', trigger: 'blur' },
    { type: 'email', message: 'Ingrese un email válido', trigger: 'blur' },
    { max: 100, message: 'El email no puede exceder 100 caracteres', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'La contraseña debe incluir mayúscula, minúscula y número',
      trigger: 'blur',
    },
  ],
})

// Reglas de validación para contraseña
const passwordRules: FormRules = reactive({
  password: [
    { required: true, message: 'La nueva contraseña es requerida', trigger: 'blur' },
    { min: 8, message: 'La contraseña debe tener al menos 8 caracteres', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'La contraseña debe incluir mayúscula, minúscula y número',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Confirme la contraseña', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
          callback(new Error('Las contraseñas no coinciden'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const maskToken = (token: string) => {
  if (!token) return ''
  if (token.length <= 8) return token
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

const getStatusType = (partner: Partner) => {
  if (partner.deleted) return 'danger'
  return partner.isActive ? 'success' : 'warning'
}

const getStatusText = (partner: Partner) => {
  if (partner.deleted) return 'Eliminado'
  return partner.isActive ? 'Activo' : 'Inactivo'
}

const copyToken = async (token: string) => {
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('Token copiado al portapapeles')
  } catch {
    ElMessage.error('Error al copiar token')
  }
}

// Computed para partners filtrados
const filteredPartners = computed(() => {
  // Filtrar primero los partners que NO estén marcados como deleted
  const notDeleted = partners.value.filter((partner: Partner) => !partner.deleted)
  const result = filterArrayLocally(notDeleted, {
    searchFields: ['name', 'lastname', 'email'],
    customFilters: {
      email: (partner: Partner, filterValue: string) => {
        if (!filterValue) return true
        return partner.email.toLowerCase().includes(filterValue.toLowerCase())
      },
      isActive: (partner: Partner, filterValue: boolean | undefined) => {
        if (filterValue === undefined) return true
        return partner.isActive === filterValue
      },
    },
  })

  return result
})

const fetchPartners = async () => {
  try {
    loading.value = true
    console.log('🔄 [PartnersView] Iniciando carga de partners...')

    // Primero intentar con paginación (que es lo que funciona en Postman)
    try {
      console.log('🔍 [PartnersView] Intentando paginación backend...')
      const response = await PartnerService.getPartnersPaginated({
        page: currentPage.value,
        items: pageSize.value,
      })
      console.log('📥 [PartnersView] Respuesta paginada:', response)
      console.log('📥 [PartnersView] Tipo de response.response:', typeof response.response)
      console.log('📥 [PartnersView] Es array response.response:', Array.isArray(response.response))
      console.log('📥 [PartnersView] Contenido completo de response.response:', JSON.stringify(response.response, null, 2))
      console.log('📥 [PartnersView] Claves de response.response:', Object.keys(response.response || {}))
      
      // Verificar que response.response sea un array
      let partnersList: Partner[] = []
      
      if (Array.isArray(response.response)) {
        partnersList = response.response
      } else if (response.response && typeof response.response === 'object') {
        // Verificar si el objeto contiene un array de partners en alguna propiedad
        const responseObj = response.response as any
        if (Array.isArray(responseObj.partners)) {
          partnersList = responseObj.partners
          console.log('📥 [PartnersView] Partners encontrados en responseObj.partners:', partnersList.length)
        } else if (Array.isArray(responseObj.data)) {
          partnersList = responseObj.data
          console.log('📥 [PartnersView] Partners encontrados en responseObj.data:', partnersList.length)
        } else if (Array.isArray(responseObj.items)) {
          partnersList = responseObj.items
          console.log('📥 [PartnersView] Partners encontrados en responseObj.items:', partnersList.length)
        } else {
          // Intentar convertir el objeto en array si contiene propiedades numéricas
          const values = Object.values(responseObj)
          if (values.length > 0 && values.every(val => val && typeof val === 'object' && 'id' in val)) {
            partnersList = values as Partner[]
            console.log('📥 [PartnersView] Partners extraídos de Object.values:', partnersList.length)
          }
        }
      }
      
      console.log('📥 [PartnersView] Partners finales extraídos:', partnersList.length)
      
      const notDeleted = partnersList.filter((partner: Partner) => !partner.deleted)
      partners.value = notDeleted
      totalPartners.value = response.pagination?.totalItems || notDeleted.length
      
      console.log('✅ [PartnersView] Partners cargados vía paginación:', partners.value.length)
    } catch (paginationError) {
      console.warn('⚠️ [PartnersView] Paginación falló, intentando getAllPartners:', paginationError)
      
      // Fallback: obtener todos los partners y paginar en frontend
      const allPartners = await PartnerService.getAllPartners()
      console.log('📥 [PartnersView] Todos los partners:', allPartners.length)
      
      const notDeleted = allPartners.filter((partner: Partner) => !partner.deleted)
      console.log('🗂️ [PartnersView] Partners no eliminados:', notDeleted.length)

      // Paginar en frontend
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      partners.value = notDeleted.slice(startIndex, endIndex)
      totalPartners.value = notDeleted.length
      
      console.log('✅ [PartnersView] Partners cargados vía getAllPartners:', partners.value.length)
    }
  } catch (error) {
    console.error('❌ [PartnersView] Error crítico al cargar partners:', error)
    ElMessage.error('Error al cargar partners')
    partners.value = []
    totalPartners.value = 0
  } finally {
    loading.value = false
    console.log('🏁 [PartnersView] Carga finalizada. Partners en vista:', partners.value.length)
  }
}

const searchByToken = async () => {
  if (!tokenSearch.value.trim()) {
    await fetchPartners()
    return
  }

  try {
    loading.value = true
    const partner = await PartnerService.getPartnerByToken(tokenSearch.value.trim())
    partners.value = [partner]
    totalPartners.value = 1
    currentPage.value = 1
    ElMessage.success('Partner encontrado por token')
  } catch (error) {
    console.error('❌ Error buscando por token:', error)
    ElMessage.error('Partner no encontrado con ese token')
    partners.value = []
    totalPartners.value = 0
  } finally {
    loading.value = false
  }
}

const editPartner = (partner: Partner) => {
  isEditing.value = true
  partnerForm.id = partner.id
  partnerForm.name = partner.name
  partnerForm.lastname = partner.lastname
  partnerForm.email = partner.email
  partnerForm.token = partner.token
  partnerForm.password = '' // No mostrar contraseña en edición
  
  showCreateDialog.value = true
}

const openPasswordDialog = (partner: Partner) => {
  selectedPartner.value = partner
  resetPasswordForm()
  showPasswordDialog.value = true
}

const togglePartnerStatus = async (partner: Partner) => {
  try {
    loading.value = true
    const action = partner.isActive ? 'desactivar' : 'activar'

    await ElMessageBox.confirm(
      `¿Estás seguro de ${action} el partner "${partner.name} ${partner.lastname}"?`,
      `Confirmar ${action}`,
      {
        confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    if (partner.isActive) {
      await PartnerService.deactivatePartner(partner.id)
      ElMessage.success('Partner desactivado exitosamente')
    } else {
      await PartnerService.activatePartner(partner.id)
      ElMessage.success('Partner activado exitosamente')
    }

    await fetchPartners()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error toggling partner status:', error)
      ElMessage.error('Error al cambiar el estado del partner')
    }
  } finally {
    loading.value = false
  }
}

const deletePartner = async (partner: Partner) => {
  try {
    await ElMessageBox.confirm(
      `¿Estás seguro de eliminar el partner "${partner.name} ${partner.lastname}"? Esta acción no se puede deshacer.`,
      'Confirmar eliminación',
      {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      },
    )

    loading.value = true
    await PartnerService.deletePartner(partner.id)
    ElMessage.success('Partner eliminado exitosamente')
    await fetchPartners()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting partner:', error)
      ElMessage.error('Error al eliminar partner')
    }
  } finally {
    loading.value = false
  }
}

const savePartner = async () => {
  if (!partnerFormRef.value) return

  await partnerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        if (isEditing.value) {
          const updateData: UpdatePartnerDto = {
            id: partnerForm.id,
            name: partnerForm.name,
            lastname: partnerForm.lastname,
            email: partnerForm.email,
            token: partnerForm.token,
          }

          await PartnerService.updatePartner(updateData)
          ElMessage.success('Partner actualizado exitosamente')
        } else {
          const createData: CreatePartnerDto = {
            name: partnerForm.name,
            lastname: partnerForm.lastname,
            email: partnerForm.email,
            password: partnerForm.password,
          }

          await PartnerService.createPartner(createData)
          ElMessage.success('Partner creado exitosamente')
        }

        resetForm()
        showCreateDialog.value = false
        await fetchPartners()
      } catch (error) {
        console.error('❌ Error saving partner:', error)
        ElMessage.error('Error al guardar partner')
      } finally {
        loading.value = false
      }
    }
  })
}

const updatePassword = async () => {
  if (!passwordFormRef.value || !selectedPartner.value) return

  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true

        const passwordData: UpdatePasswordPartnerDto = {
          id: selectedPartner.value!.id,
          password: passwordForm.password,
        }

        await PartnerService.updatePartnerPassword(passwordData)
        ElMessage.success('Contraseña actualizada exitosamente')
        
        resetPasswordForm()
        showPasswordDialog.value = false
      } catch (error) {
        console.error('❌ Error updating password:', error)
        ElMessage.error('Error al actualizar contraseña')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  partnerForm.id = 0
  partnerForm.name = ''
  partnerForm.lastname = ''
  partnerForm.email = ''
  partnerForm.password = ''
  partnerForm.token = ''
  isEditing.value = false
  partnerFormRef.value?.resetFields()
}

const resetPasswordForm = () => {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

const openCreateDialog = () => {
  resetForm()
  showCreateDialog.value = true
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchPartners()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPartners()
}

// Inicialización
onMounted(async () => {
  console.log('🚀 [PartnersView] Componente montado, iniciando carga de partners...')
  await fetchPartners()
})
</script>

<style scoped>
.partners-page {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.partner-email {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.token-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-display {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.copy-token-btn {
  padding: 4px;
  min-height: auto;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
