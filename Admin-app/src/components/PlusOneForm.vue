<template>
  <el-dialog
    v-model="openDialog"
    title="Manage Plus Ones"
    width="640px"
    @close="handleClose"
    @open="handleOpen"
  >
    <template #default>
      <el-container v-loading="fetchingData" id="modal-wrapper">
        <el-empty v-if="plusOnes.length === 0 && !fetchingData" description="No plus one added yet">
          <el-button
            :icon="Plus"
            type="primary"
            :disabled="isAtLimit"
            @click="openAddForm"
          >
            Add your plus one
          </el-button>
        </el-empty>

        <el-container v-else id="modal-body__populated" >
          <div class="list-header">
            <div>
              <h3>Plus ones</h3>
              <p class="muted">Manage the guest's plus ones</p>
            </div>
            <div>
              <el-button
                type="primary"
                size="small"
                :disabled="isAtLimit"
                @click="openAddForm"
              >
                <el-icon><Plus /></el-icon>
                Add
              </el-button>
            </div>
          </div>

          <ul class="plus-one-list">
            <li v-for="(p, idx) in plusOnes" :key="p.plus_one_id ?? idx" class="plus-one-item">
              <div class="plus-one-info">
                <div class="plus-one-name">{{ formatName(p.name) }}</div>
                <div class="plus-one-meta">{{ p.type ?? '' }}</div>
              </div>
              <div class="plus-one-actions">
                <el-button circle size="small" @click="openEditForm(idx)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  circle
                  size="small"
                  type="danger"
                  @click="confirmDelete(idx)"
                  :loading="deleting && deletingIndex === idx"
                  :disabled="deleting"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </li>
          </ul>
        </el-container>
      </el-container>
    </template>

    <template v-if="plusOnes.length !== 0" #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
        <el-button type="primary" @click="saveAndClose" :loading="savingData">Save</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="showEditDialog" :title="editingIndex === null ? 'Add Plus One' : 'Edit Plus One'" width="520px">
    <el-form ref="formRef" :model="editingModel" :rules="rules" label-width="110px">
      <el-form-item label="Titles" prop="name.titles">
        <el-input-tag v-model="editingModel.name.titles" placeholder="Titles (optional)" />
      </el-form-item>

      <el-form-item label="First name" prop="name.first_name">
        <el-input v-model="editingModel.name.first_name" placeholder="First name" />
      </el-form-item>

      <el-form-item label="Middle name" prop="name.middle_name">
        <el-input v-model="editingModel.name.middle_name" placeholder="Middle name" />
      </el-form-item>

      <el-form-item label="Last name" prop="name.last_name">
        <el-input v-model="editingModel.name.last_name" placeholder="Last name" />
      </el-form-item>

      <el-form-item label="Suffixes" prop="name.suffixes">
        <el-input-tag v-model="editingModel.name.suffixes" placeholder="Suffixes (optional)" />
      </el-form-item>

      <el-form-item label="Relationship" prop="relationship">
        <el-select v-model="editingModel.type" placeholder="Relation to guest (optional)">
          <el-option value="spouse" label="Spouse"/>
          <el-option value="others" label="Others"/>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">Cancel</el-button>
        <el-button type="primary" @click="submitEdit">{{ editingIndex === null ? 'Add' : 'Update' }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { CompleteGuestData, PlusOneType, GuestName, PlusOne } from '@/types/guest'
import { useGuestStore } from '@/stores/guest'

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { guestId: string | number | null, plus_ones: any[] }): void
  (e: 'close'): void
}>()

const props = defineProps<{
  modelValue: boolean
  id: string | undefined
  loading: boolean
}>()

const openDialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const guestStore = useGuestStore()

// Editable plus-one shape used in the form:
// Omit audit fields and make plus_one_id optional; include guest_id and allow null when absent
type EditablePlusOne = Omit<PlusOne, 'plus_one_id'|'guest_id'|'created_at'|'updated_at'|'created_by'|'updated_by'> & { plus_one_id?: string, guest_id: string }

// Local copy of plus ones (omit timestamps/audit fields during editing)
const plusOnes = ref<EditablePlusOne[]>([])
const initialData = ref<CompleteGuestData | null>(null)
const fetchingData = ref<boolean>(false)

// Editing state
const showEditDialog = ref(false)
const editingIndex = ref<number | null>(null)
const formRef = ref()
const deleting = ref<boolean>(false)
const deletingIndex = ref<number | null>(null)

// model for the add/edit form will be declared below after computed helpers so guestIdStr is available

// computed helpers
const guestId = computed(() => props.id ?? null)
// non-null guest id string used by the form; falls back to empty string when not provided
const guestIdStr = computed(() => props.id ?? '')
const plusOneLimit = computed(() => initialData.value?.guest.plus_one_limit ?? 0)
const isAtLimit = computed(() => plusOnes.value.length >= plusOneLimit.value)
const savingData = computed(() => props.loading)

// model for the add/edit form - conforms to EditablePlusOne
const editingModel = ref<EditablePlusOne>({
  guest_id: guestIdStr.value,
  name: {
    titles: [] as unknown as [],
    first_name: '',
    middle_name: '',
    last_name: '',
    suffixes: [] as unknown as []
  } as any,
  type: 'others' as PlusOneType
})

const handleClose = () => {
  emit('close')
}

const handleOpen = async () => {
  console.log('Plus one dialog opened')
  if(!props.id) {
    throw new Error('No guest id present in props')
  }

  if(!guestStore.guest) {
    console.log('no guest data for id:', props.id, 'fetching new data')
    try {
      fetchingData.value = true
      await guestStore.fetchGuestData(props.id)
      initialData.value = guestStore.guest as CompleteGuestData | null
    }catch (err) {
      throw (`Failed to fetch data for ${props.id}: ${err}`)
    } finally {
      fetchingData.value = false
    }
  }else if(guestStore.guest.guest.guest_id !== props.id) {
    try {
      fetchingData.value = true
      await guestStore.fetchGuestData(props.id)
      initialData.value = guestStore.guest as CompleteGuestData | null
    }catch (err) {
      throw (`Failed to fetch data for ${props.id}: ${err}`)
    } finally {
      fetchingData.value = false
    }
  }else {
    initialData.value = guestStore.guest
  }
}

const rules = {
  'name.first_name': [{ required: true, message: 'First name is required', trigger: 'blur' }]
}

// sync when initialData changes
watch(() => initialData.value, (g) => {
  // copy plus ones but ensure guest_id is present and remove audit fields
  plusOnes.value = g?.plus_ones ? (g.plus_ones as PlusOne[]).map(p => ({
    plus_one_id: p.plus_one_id,
    guest_id: (g.guest && g.guest.guest_id) ? g.guest.guest_id : guestIdStr.value,
    type: p.type,
    name: JSON.parse(JSON.stringify(p.name)) as any
  })) : []
}, { immediate: true })

const openAddForm = () => {
  if (isAtLimit.value) return
  editingIndex.value = null
  // initialize new editable plus one with guest_id set
  editingModel.value = {
    guest_id: guestIdStr.value,
    name: { titles: [] as unknown as [], first_name: '', middle_name: '', last_name: '', suffixes: [] as unknown as [] } as any,
    type: 'others' as PlusOneType
  }
  showEditDialog.value = true
}

const openEditForm = (index: number) => {
  const p = plusOnes.value[index]
  if (!p) return
  editingIndex.value = index
  // Preserve existing plus_one_id if present so edits keep the DB identifier
  // deep clone and ensure guest_id is preserved/updated to current guest
  const cloned = JSON.parse(JSON.stringify(p)) as EditablePlusOne
  cloned.guest_id = p.guest_id ?? guestIdStr.value
  editingModel.value = cloned
  showEditDialog.value = true
}

const cancelEdit = () => {
  showEditDialog.value = false
  editingIndex.value = null
}

const submitEdit = async () => {
  try {
    if (!formRef.value || typeof formRef.value.validate !== 'function') {
      console.warn('Form reference is not ready')
      return
    }
    await formRef.value.validate()
  } catch (err) {
    return
  }

  if (editingIndex.value === null) {
    // add
    const toAdd = JSON.parse(JSON.stringify(editingModel.value)) as EditablePlusOne
    toAdd.guest_id = guestIdStr.value
    plusOnes.value.push(toAdd)
  } else {
    // update - ensure plus_one_id is preserved from the original when present
    const updated = JSON.parse(JSON.stringify(editingModel.value)) as EditablePlusOne
    const original = plusOnes.value[editingIndex.value]
    if (original && original.plus_one_id !== undefined && updated.plus_one_id === undefined) {
      updated.plus_one_id = original.plus_one_id
    }
    // ensure guest_id remains set
    updated.guest_id = original?.guest_id ?? guestIdStr.value
    plusOnes.value.splice(editingIndex.value, 1, updated)
  }

  showEditDialog.value = false
  editingIndex.value = null
}

const confirmDelete = async (index: number) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to remove this plus one?', 'Remove Plus One', {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning'
    })

    // set deleting state and track index for button loading
    deleting.value = true
    deletingIndex.value = index

    const target = plusOnes.value[index]
    const id = target?.plus_one_id

    if (!id) {
      // If no id present, remove locally only
      plusOnes.value.splice(index, 1)
      ElMessage.success('Plus one removed')
      return
    }

    // Call store to delete from DB
    await guestStore.deletePlusOne(String(id))

    // On success, remove locally
    plusOnes.value.splice(index, 1)
    ElMessage.success('Plus one removed')
  } catch (e: any) {
    // cancelled or failed
    if (e === 'cancel' || (e && e.action === 'cancel')) {
      // user cancelled
    } else {
      console.error('Failed to delete plus one:', e)
      const msg = e && e.message ? `Failed to remove plus one: ${e.message}` : 'Failed to remove plus one'
      ElMessage.error(msg)
    }
  } finally {
    deleting.value = false
    deletingIndex.value = null
  }
}

const saveAndClose = () => {
  // ensure every plus one has the guest_id before emitting
  const normalized = plusOnes.value.map(p => ({ ...p, guest_id: p.guest_id ?? guestIdStr.value }))
  emit('save', { guestId: guestId.value, plus_ones: normalized })
  openDialog.value = false
}

// helper to format name according to guest Name type
function formatName(name: GuestName | any) {
  if (!name) return ''
  const titles = Array.isArray(name.titles) ? name.titles.join(' ') : (name.titles || '')
  const suffixes = Array.isArray(name.suffixes) ? name.suffixes.join(' ') : (name.suffixes || '')
  return `${titles ? titles + ' ' : ''}${name.first_name || ''}${name.middle_name ? ' ' + name.middle_name : ''}${name.last_name ? ' ' + name.last_name : ''}${suffixes ? ' ' + suffixes : ''}`.trim()
}
</script>

<style scoped>
.el-container#modal-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 160px;
}
.el-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0;
  flex-grow: 1;
  width: 100%;
}
.el-container#modal-body__populated {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.plus-one-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.plus-one-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color);
}
.plus-one-info {
  display: flex;
  flex-direction: column;
}
.plus-one-name {
  font-weight: 500;
}
.plus-one-meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>