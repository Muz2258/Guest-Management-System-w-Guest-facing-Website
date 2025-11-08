<template>
  <div class="seating-view">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>Seating</h1>
        <p class="description">
          Define the seating arrangement of your guests
        </p>
      </div>
      <div v-if="seatingStore.seatingArrangement.length > 0" class="action-buttons">
        <el-button type="primary" @click="handleAddTable">
          Add New Table
        </el-button>
      </div>
    </div>

    <!-- Empty State -->
    <el-empty
      v-if="!seatingStore.isLoading && seatingStore.seatingArrangement.length === 0"
      description="Start creating your seating arrangement"
    >
      <el-button type="primary" @click="handleAddTable">Add First Table</el-button>
    </el-empty>

    <!-- Tables Grid -->
    <div v-else class="tables-container" v-loading="seatingStore.isLoading">
      <el-card
        v-for="table in sortedTables"
        :key="table.table_id"
        class="table-card"
        shadow="hover"
      >
        <!-- Card Header -->
        <template #header>
          <div class="card-header">
            <div class="table-info">
              <h3 class="table-title">
                Table {{ table.table_number }}
                <span v-if="table.table_name" class="table-name">- {{ table.table_name }}</span>
              </h3>
              <div class="capacity-info">
                <el-tag :type="getCapacityType(table)" size="small">
                  {{ table.assigned_count }} / {{ table.capacity }}
                </el-tag>
              </div>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => handleTableAction(cmd, table)">
              <el-button circle :icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    Edit Table
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    Delete Table
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <!-- Card Body -->
        <div class="card-body">
          <!-- Empty State for Table -->
          <div v-if="table.assignments.length === 0" class="table-empty-state">
            <el-empty description="No guests assigned yet" :image-size="80">
              <el-button type="primary" plain @click="handleAddGuestsToTable(table)">
                Add Guests
              </el-button>
            </el-empty>
          </div>

          <!-- Guest List -->
          <div v-else class="guest-list">
            <div
              v-for="assignment in table.assignments"
              :key="assignment.assignment_id"
              class="guest-item"
            >
              <div class="guest-info">
                <span class="guest-name">{{ formatAssignmentName(assignment) }}</span>
                <el-tag size="small" :type="getAssignmentTypeColor(assignment.assignment_type)">
                  {{ formatAssignmentType(assignment.assignment_type) }}
                </el-tag>
              </div>
              <el-button
                circle
                size="small"
                :icon="Close"
                @click="handleRemoveAssignment(assignment)"
              />
            </div>
            <el-button
              v-if="table.available_count > 0"
              class="add-more-btn"
              type="primary"
              plain
              @click="handleAddGuestsToTable(table)"
            >
              Add More Guests ({{ table.available_count }} seats available)
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Table Form Dialog -->
    <TableForm
      v-model:visible="showTableForm"
      :table-data="selectedTable"
      @success="handleTableFormSuccess"
    />

    <!-- Unassigned Guests Drawer -->
    <el-drawer
      v-model="showUnassignedDrawer"
      title="Add Guests to Table"
      direction="rtl"
      size="500px"
    >
      <template #header>
        <div class="drawer-header">
          <h3>{{ currentTable?.table_name || `Table ${currentTable?.table_number}` }}</h3>
          <p class="drawer-subtitle">
            {{ currentTable?.available_count }} seats available
          </p>
        </div>
      </template>

      <div class="drawer-content">
        <!-- Search Input -->
        <el-input
          v-model="searchQuery"
          placeholder="Search guests by name..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @clear="searchQuery = ''"
        />

        <!-- Loading State -->
        <div v-if="seatingStore.isLoading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- Empty State -->
        <el-empty
          v-else-if="filteredUnassignedGuests.length === 0"
          description="No unassigned guests found"
          :image-size="100"
        />

        <!-- Guest List -->
        <div v-else class="unassigned-list">
          <div
            v-for="guest in filteredUnassignedGuests"
            :key="`${guest.id}-${guest.type}`"
            class="unassigned-item"
          >
            <div class="guest-details">
              <div class="guest-name-info">
                <span class="name">{{ guest.name }}</span>
                <el-tag v-if="guest.type" size="small" type="info">
                  {{ formatGuestType(guest.type) }}
                </el-tag>
              </div>
              <div v-if="guest.category || guest.family_side" class="guest-meta">
                <span v-if="guest.category" class="meta-item">{{ guest.category }}</span>
                <span v-if="guest.family_side" class="meta-item">{{ guest.family_side }}</span>
              </div>
            </div>
            <el-button
              v-if="!isGuestAdded(guest.id, guest.type)"
              type="primary"
              size="small"
              @click="handleAddGuest(guest)"
              :loading="addingGuestId === guest.id"
            >
              Add
            </el-button>
            <el-button
              v-else
              type="danger"
              size="small"
              plain
              @click="handleRemoveGuest(guest)"
              :loading="removingGuestId === guest.id"
            >
              Remove
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { More, Edit, Delete, Close, Search } from '@element-plus/icons-vue'
import { useSeatingStore } from '@/stores/seating'
import TableForm from '@/components/TableForm.vue'
import type { SeatingTable, Assignment } from '@/types/seating'

const seatingStore = useSeatingStore()

// State
const showTableForm = ref(false)
const showUnassignedDrawer = ref(false)
const selectedTable = ref<SeatingTable | undefined>()
const currentTable = ref<SeatingTable | undefined>()
const searchQuery = ref('')
const addingGuestId = ref<string | null>(null)
const removingGuestId = ref<string | null>(null)

// Computed
const sortedTables = computed(() => {
  return [...seatingStore.seatingArrangement].sort((a, b) => {
    return a.display_order - b.display_order
  })
})

const filteredUnassignedGuests = computed(() => {
  const query = searchQuery.value?.trim()
  
  if (!query || query === '') {
    return seatingStore.unassignedGuests
  }

  const searchTerm = query.toLowerCase()
  return seatingStore.unassignedGuests.filter((guest) => {
    const guestName = guest.name?.toLowerCase() || ''
    return guestName.includes(searchTerm)
  })
})

// Methods
const handleAddTable = () => {
  selectedTable.value = undefined
  showTableForm.value = true
}

const handleTableAction = (command: string, table: SeatingTable) => {
  if (command === 'edit') {
    selectedTable.value = table
    showTableForm.value = true
  } else if (command === 'delete') {
    handleDeleteTable(table)
  }
}

const handleDeleteTable = async (table: SeatingTable) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete Table ${table.table_number}${table.table_name ? ` - ${table.table_name}` : ''}? ${
        table.assigned_count > 0
          ? 'This will unassign all guests from this table.'
          : ''
      }`,
      'Delete Table',
      {
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    await seatingStore.deleteTable(table.table_id)
    ElMessage.success('Table deleted successfully')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete table:', error)
    }
  }
}

const handleTableFormSuccess = () => {
  seatingStore.fetchSeatingChart()
}

const handleAddGuestsToTable = async (table: SeatingTable) => {
  currentTable.value = table
  searchQuery.value = ''
  showUnassignedDrawer.value = true
  await seatingStore.fetchUnassignedGuests()
}

const handleRemoveAssignment = async (assignment: Assignment) => {
  try {
    await ElMessageBox.confirm(
      `Remove ${formatAssignmentName(assignment)} from this table?`,
      'Remove Guest',
      {
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    await seatingStore.removeAssignment(assignment.assignment_id)
    ElMessage.success('Guest removed from table')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to remove assignment:', error)
    }
  }
}

const handleAddGuest = async (guest: any) => {
  if (!currentTable.value) return

  try {
    addingGuestId.value = guest.id

    if (guest.type === 'plus_one') {
      await seatingStore.assignPlusOneToTable(guest.id, currentTable.value.table_id)
    } else {
      // For primary guests and spouses, we'll assign the guest
      // The backend RPC function will handle spouse assignment based on assignSpouse parameter
      const assignSpouse = guest.has_spouse && guest.type !== 'spouse'
      await seatingStore.assignGuestToTable(guest.id, currentTable.value.table_id, assignSpouse)
    }

    ElMessage.success(`${guest.name} added to table`)
    
    // Refresh unassigned guests list to update the UI
    await seatingStore.fetchUnassignedGuests()
    
    // Update currentTable reference to reflect the new assignments
    const updatedTable = seatingStore.seatingArrangement.find(
      (t) => t.table_id === currentTable.value?.table_id
    )
    if (updatedTable) {
      currentTable.value = updatedTable
    }
  } catch (error) {
    console.error('Failed to add guest:', error)
  } finally {
    addingGuestId.value = null
  }
}

const handleRemoveGuest = async (guest: any) => {
  if (!currentTable.value) return

  try {
    removingGuestId.value = guest.id

    // Find the assignment in the current table
    const assignment = currentTable.value.assignments.find((a) => {
      return a.id === guest.id && (
        (guest.type === 'plus_one' && a.assignment_type === 'plus_one') ||
        (guest.type !== 'plus_one' && a.assignment_type !== 'plus_one')
      )
    })

    if (assignment) {
      await seatingStore.removeAssignment(assignment.assignment_id)
      ElMessage.success(`${guest.name} removed from table`)
      
      // Refresh unassigned guests list to update the UI
      await seatingStore.fetchUnassignedGuests()
      
      // Update currentTable reference to reflect the removed assignment
      const updatedTable = seatingStore.seatingArrangement.find(
        (t) => t.table_id === currentTable.value?.table_id
      )
      if (updatedTable) {
        currentTable.value = updatedTable
      }
    }
  } catch (error) {
    console.error('Failed to remove guest:', error)
  } finally {
    removingGuestId.value = null
  }
}

const isGuestAdded = (guestId: string, guestType: string) => {
  if (!currentTable.value) return false

  return currentTable.value.assignments.some((assignment) => {
    if (guestType === 'plus_one') {
      return assignment.id === guestId && assignment.assignment_type === 'plus_one'
    } else {
      return assignment.id === guestId && assignment.assignment_type !== 'plus_one'
    }
  })
}

const formatAssignmentName = (assignment: Assignment) => {
  const parts = []
  
  if (assignment.name.titles && assignment.name.titles.length > 0) {
    parts.push(assignment.name.titles.join(' '))
  }
  
  parts.push(assignment.name.first_name)
  
  if (assignment.name.middle_name) {
    parts.push(assignment.name.middle_name)
  }
  
  if (assignment.name.last_name) {
    parts.push(assignment.name.last_name)
  }
  
  if (assignment.name.suffixes && assignment.name.suffixes.length > 0) {
    parts.push(assignment.name.suffixes.join(' '))
  }
  
  return parts.join(' ')
}

const formatAssignmentType = (type: string) => {
  switch (type) {
    case 'primary_guest':
      return 'Primary'
    case 'spouse':
      return 'Spouse'
    case 'plus_one':
      return 'Plus One'
    default:
      return type
  }
}

const formatGuestType = (type: string) => {
  switch (type) {
    case 'primary_guest':
      return 'Guest'
    case 'spouse':
      return 'Spouse'
    case 'plus_one':
      return 'Plus One'
    default:
      return type
  }
}

const getCapacityType = (table: SeatingTable) => {
  const percentage = (table.assigned_count / table.capacity) * 100
  
  if (percentage === 100) return 'danger'
  if (percentage >= 80) return 'warning'
  if (percentage > 0) return 'success'
  return 'info'
}

const getAssignmentTypeColor = (type: string) => {
  switch (type) {
    case 'primary_guest':
      return 'primary'
    case 'spouse':
      return 'success'
    case 'plus_one':
      return 'warning'
    default:
      return 'info'
  }
}

// Lifecycle
onMounted(() => {
  seatingStore.fetchSeatingChart()
})
</script>

<style scoped>
.seating-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.description {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.tables-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding-bottom: 24px;
  overflow-y: auto;
  min-height: 0;
  grid-auto-rows: max-content;
}

.table-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.table-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.table-name {
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.capacity-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  min-height: 120px;
}

.table-empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.guest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guest-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  transition: background-color 0.3s;
}

.guest-item:hover {
  background-color: var(--el-fill-color);
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.guest-name {
  font-weight: 500;
}

.add-more-btn {
  width: 100%;
  margin-top: 8px;
}

.drawer-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
}

.drawer-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.search-input {
  margin-bottom: 8px;
}

.loading-state {
  padding: 16px;
}

.unassigned-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.unassigned-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.3s;
}

.unassigned-item:hover {
  background-color: var(--el-fill-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.guest-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.guest-name-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guest-name-info .name {
  font-weight: 500;
  font-size: 15px;
}

.guest-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item::before {
  content: '•';
  margin-right: 8px;
  color: var(--el-text-color-placeholder);
}

.meta-item:first-child::before {
  content: '';
  margin-right: 0;
}
</style>