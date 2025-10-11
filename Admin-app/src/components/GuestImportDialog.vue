<template>
  <el-dialog
    v-model="dialogVisible"
    title="Import Guests from CSV"
    width="80%"
    @close="handleClose"
  >
    <!-- Step 1: File Upload -->
    <div v-if="currentStep === 1" class="upload-step">
      <el-upload
        ref="uploadRef"
        class="csv-upload"
        drag
        accept=".csv"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
      >
        <el-icon><Upload /></el-icon>
        <div class="el-upload__text">
          Drop CSV file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            CSV file should include: Name, Phone, Category, Guest Type, Plus One Eligibility
          </div>
        </template>
      </el-upload>

      <div v-if="parseError" class="error-message">
        {{ parseError }}
      </div>
    </div>

    <!-- Step 2: Preview and Validation -->
    <div v-if="currentStep === 2" class="preview-step">
      <div class="validation-summary" v-if="validationSummary.length">
        <h4>Validation Issues:</h4>
        <el-alert
          v-for="(error, index) in validationSummary"
          :key="index"
          :title="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>

      <el-table
        v-loading="loading"
        :data="previewData"
        style="width: 100%; margin-top: 20px;"
        max-height="400"
      >
        <el-table-column label="Row" prop="rowIndex" width="80" />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isValid ? 'success' : 'danger'" size="small">
              {{ row.isValid ? 'Valid' : 'Error' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="data.name" />
        <el-table-column label="Category" prop="data.guest_category" />
        <el-table-column label="Guest Type" prop="data.guest_type" />
        <el-table-column label="Plus One" prop="data.plus_one_eligibility" />
        <el-table-column label="Issues" width="300">
          <template #default="{ row }">
            <div v-if="row.errors.length" class="row-errors">
              <el-tooltip
                v-for="(error, index) in row.errors"
                :key="index"
                :content="error"
                placement="top"
              >
                <el-icon class="error-icon"><Warning /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog Footer -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <!-- <el-button
          v-if="currentStep === 1"
          type="primary"
          :disabled="!selectedFile"
          @click="handlePreview"
        >
          Preview
        </el-button>
        <el-button
          v-else
          type="primary"
          :disabled="!canImport"
          :loading="importing"
          @click="handleImport"
        >
          Import {{ validRows.length }} Guest{{ validRows.length !== 1 ? 's' : '' }}
        </el-button> -->
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Warning } from '@element-plus/icons-vue'
import Papa from 'papaparse'
import type { UploadInstance, UploadProps } from 'element-plus'
import type { Guest, GuestCategory, GuestType, PlusOneEligibility } from '@/types/guest'

interface ParsedRow {
  rowIndex: number
  data: Partial<Guest>
  isValid: boolean
  errors: string[]
  isDuplicate?: boolean
}

const props = defineProps<{
  modelValue: boolean
  existingGuests: Guest[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'import', guests: Partial<Guest>[]): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Component state
const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const previewData = ref<ParsedRow[]>([])
const parseError = ref('')
const loading = ref(false)
const importing = ref(false)
const uploadRef = ref<UploadInstance>()

// Computed properties for validation
const validRows = computed(() => previewData.value.filter(row => row.isValid))
const canImport = computed(() => validRows.value.length > 0)
const validationSummary = computed(() => {
  const summary = []
  const totalRows = previewData.value.length
  const validCount = validRows.value.length
  const duplicateCount = previewData.value.filter(row => row.isDuplicate).length

  if (totalRows === 0) return ['No data to import']
  if (validCount === 0) summary.push('No valid rows to import')
  if (duplicateCount > 0) summary.push(`${duplicateCount} duplicate entries found`)
  
  return summary
})

// Guest type validation
const validGuestTypes = new Set<GuestType>(['single', 'couple'])
const validCategories = new Set<GuestCategory>(['family', 'friend', 'asoebi', 'bestman', 'chiefbridesmaid'])
const validPlusOneStatus = new Set<PlusOneEligibility>(['eligible', 'not_eligible'])

// Validation functions
/* function validateRow(row: any, rowIndex: number): ParsedRow {
  const errors: string[] = []
  const parsedRow: ParsedRow = {
    rowIndex: rowIndex + 1,
    data: {},
    isValid: true,
    errors: []
  }

  // Validate name
  if (!row.name) {
    errors.push('Name is required')
  } else {
    parsedRow.data.name = row.name.trim()
    // Check for duplicates
    const isDuplicate = props.existingGuests.some(
      guest => guest.name.toLowerCase() === parsedRow.data.name?.toLowerCase()
    )
    if (isDuplicate) {
      errors.push('Guest with this name already exists')
      parsedRow.isDuplicate = true
    }
  }

  // Validate guest type
  if (!row.guest_type) {
    errors.push('Guest type is required')
  } else if (!validGuestTypes.has(row.guest_type.toLowerCase() as GuestType)) {
    errors.push('Invalid guest type')
  } else {
    parsedRow.data.guest_type = row.guest_type.toLowerCase() as GuestType
  }

  // Validate category
  if (!row.guest_category) {
    errors.push('Category is required')
  } else if (!validCategories.has(row.guest_category.toLowerCase() as GuestCategory)) {
    errors.push('Invalid guest category')
  } else {
    parsedRow.data.guest_category = row.guest_category.toLowerCase() as GuestCategory
  }

  // Validate plus one eligibility
  if (row.plus_one_eligibility) {
    const plusOne = row.plus_one_eligibility.toLowerCase()
    if (!validPlusOneStatus.has(plusOne as PlusOneEligibility)) {
      errors.push('Invalid plus one eligibility')
    } else {
      parsedRow.data.plus_one_eligibility = plusOne as PlusOneEligibility
    }
  } else {
    parsedRow.data.plus_one_eligibility = 'not_eligible'
  }

  // Set default values for other fields
  parsedRow.data.invitation_type = 'rsvp_guest'
  parsedRow.data.invitation_method = 'digital'

  parsedRow.errors = errors
  parsedRow.isValid = errors.length === 0

  return parsedRow
} */

// Event handlers
const handleFileChange: UploadProps['onChange'] = (uploadFile) => {
  selectedFile.value = uploadFile.raw ?? null
  parseError.value = ''
}

/* const handlePreview = () => {
  if (!selectedFile.value) return

  loading.value = true
  parseError.value = ''
  previewData.value = []

  Papa.parse(selectedFile.value, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length) {
        const errorMessage = results.errors[0]?.message || 'Unknown parsing error'
        parseError.value = 'Failed to parse CSV file: ' + errorMessage
        loading.value = false
        return
      }

      previewData.value = results.data.map((row, index) => validateRow(row, index))
      currentStep.value = 2
      loading.value = false
    },
    error: (error) => {
      parseError.value = 'Failed to read CSV file: ' + error.message
      loading.value = false
    }
  })
} */

const handleImport = async () => {
  if (!canImport.value) return

  try {
    importing.value = true
    const validGuests = validRows.value.map(row => row.data)
    emit('import', validGuests)
    ElMessage.success(`Successfully prepared ${validGuests.length} guests for import`)
    handleClose()
  } catch (error) {
    ElMessage.error('Failed to import guests')
    console.error('Import error:', error)
  } finally {
    importing.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
  currentStep.value = 1
  selectedFile.value = null
  previewData.value = []
  parseError.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}
</script>

<style scoped>
.upload-step {
  text-align: center;
}

.preview-step {
  margin-top: 20px;
}

.validation-summary {
  margin-bottom: 20px;
}

.validation-summary h4 {
  margin-bottom: 10px;
}

.row-errors {
  display: flex;
  gap: 4px;
}

.error-icon {
  color: var(--el-color-danger);
}

.error-message {
  color: var(--el-color-danger);
  margin-top: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}
</style>
