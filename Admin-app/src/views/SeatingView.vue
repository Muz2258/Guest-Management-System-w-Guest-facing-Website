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
        <el-segmented v-model="viewMode" :options="viewOptions" size="default" />
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

    <!-- Cards View -->
    <div v-else-if="viewMode === 'cards'" class="tables-container" v-loading="seatingStore.isLoading">
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

    <!-- Floor Plan View -->
    <div v-else-if="viewMode === 'floorplan'" class="floor-plan-container" v-loading="seatingStore.isLoading">
      <!-- Legend -->
      <div class="floor-plan-legend">
        <div class="legend-title">Guest Types:</div>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-box assignment-primary_guest"></div>
            <span>Primary Guest</span>
          </div>
          <div class="legend-item">
            <div class="legend-box assignment-spouse"></div>
            <span>Spouse</span>
          </div>
          <div class="legend-item">
            <div class="legend-box assignment-plus_one"></div>
            <span>Plus One</span>
          </div>
          <div class="legend-item">
            <div class="legend-box empty-seat"></div>
            <span>Empty Seat</span>
          </div>
        </div>
      </div>

      <div class="floor-plan">
        <!-- Stage -->
        <div class="stage-area">
          <div class="stage-label">Stage</div>
        </div>

        <!-- Dance Floor -->
        <div class="dance-floor">
          <div class="dance-floor-label">Dance floor</div>
        </div>

        <!-- Walkway -->
        <div class="walkway">
          <div class="walkway-label">Walkway</div>
        </div>

        <!-- Tables positioned based on the floor plan -->
        <div
          v-for="table in sortedTables"
          :key="table.table_id"
          class="floor-plan-table"
          :style="getTablePosition(table)"
        >
          <div class="table-circle">
            <div class="table-center">
              <div class="table-number-label">Table {{ table.table_number }}</div>
              <div class="table-capacity">{{ table.assigned_count }}/{{ table.capacity }}</div>
            </div>
            
            <!-- Guest name tags around the table -->
            <div
              v-for="(assignment, index) in table.assignments"
              :key="assignment.assignment_id"
              class="name-tag"
              :class="`assignment-${assignment.assignment_type}`"
              :style="getNameTagPosition(index, table.capacity)"
              @click="(e) => handleNameTagClick(e, assignment, table)"
              @mouseenter="(e) => showTooltip(e, assignment)"
              @mouseleave="hideTooltip"
            >
              <span class="name-tag-text">{{ formatShortName(assignment) }}</span>
            </div>

            <!-- Empty seat placeholders -->
            <div
              v-for="index in table.available_count"
              :key="`empty-${index}`"
              class="name-tag empty-seat"
              :style="getNameTagPosition(table.assigned_count + index - 1, table.capacity)"
              @click="handleAddGuestsToTable(table)"
              :title="`Add guest to Table ${table.table_number}`"
            >
              <span class="name-tag-text">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Tooltip Portal -->
    <Teleport to="body">
      <div
        v-if="tooltipVisible"
        class="global-tooltip"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`
        }"
      >
        <div class="tooltip-name">{{ formatAssignmentName(tooltipAssignment!) }}</div>
        <div class="tooltip-details">
          <div class="tooltip-row">
            <span class="tooltip-label">Type:</span>
            <el-tag size="small" :type="getAssignmentTypeColor(tooltipAssignment!.assignment_type)">
              {{ formatAssignmentType(tooltipAssignment!.assignment_type) }}
            </el-tag>
          </div>
          <div v-if="tooltipAssignment!.guest_category" class="tooltip-row">
            <span class="tooltip-label">Category:</span>
            <span class="tooltip-value">{{ tooltipAssignment!.guest_category }}</span>
          </div>
          <div v-if="tooltipAssignment!.family_side" class="tooltip-row">
            <span class="tooltip-label">Side:</span>
            <span class="tooltip-value">{{ tooltipAssignment!.family_side }}</span>
          </div>
        </div>
      </div>

      <!-- Guest Actions Menu -->
      <div
        v-if="showGuestActionsMenu && selectedGuest"
        class="guest-actions-menu"
        :style="{
          left: `${guestActionsPosition.x}px`,
          top: `${guestActionsPosition.y}px`
        }"
        @click.stop
      >
        <div class="menu-header">
          <strong>{{ formatAssignmentName(selectedGuest.assignment) }}</strong>
        </div>
        <div class="menu-item" @click="handleMoveGuest">
          <el-icon><Edit /></el-icon>
          <span>Move to Table</span>
        </div>
        <div class="menu-item" @click="handleStartSwap">
          <el-icon><Sort /></el-icon>
          <span>Swap with Guest</span>
        </div>
        <div class="menu-item danger" @click="handleRemoveFromMenu">
          <el-icon><Delete /></el-icon>
          <span>Remove from Table</span>
        </div>
      </div>
    </Teleport>

    <!-- Swap Dialog -->
    <el-dialog
      v-model="showSwapDialog"
      :title="swapStep === 'table' ? 'Select Target Table' : 'Select Guest to Swap'"
      width="500px"
      @close="handleCloseSwapDialog"
    >
      <!-- Step 1: Select Table -->
      <div v-if="swapStep === 'table'" class="swap-table-list">
        <div v-if="selectedGuest" class="current-selection-info">
          <p class="info-text">
            <el-icon><InfoFilled /></el-icon>
            Swapping: <strong>{{ formatAssignmentName(selectedGuest.assignment) }}</strong> from Table {{ selectedGuest.table.table_number }}
          </p>
        </div>
        <el-empty
          v-if="sortedTables.filter(t => t.table_id !== selectedGuest?.table.table_id && t.assigned_count > 0).length === 0"
          description="No other tables with guests available"
        />
        <div
          v-for="table in sortedTables.filter(t => t.table_id !== selectedGuest?.table.table_id && t.assigned_count > 0)"
          :key="table.table_id"
          class="swap-table-item"
          @click="handleSelectSwapTable(table)"
        >
          <div class="swap-table-info">
            <h4>Table {{ table.table_number }} {{ table.table_name ? `- ${table.table_name}` : '' }}</h4>
            <span class="guest-count">{{ table.assigned_count }} guest{{ table.assigned_count !== 1 ? 's' : '' }}</span>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- Step 2: Select Guest -->
      <div v-if="swapStep === 'guest' && swapTargetTable" class="swap-guest-list">
        <el-button text @click="swapStep = 'table'" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          Back to tables
        </el-button>
        <div class="selected-table-info">
          <h4>Table {{ swapTargetTable.table_number }} {{ swapTargetTable.table_name ? `- ${swapTargetTable.table_name}` : '' }}</h4>
        </div>
        <div
          v-for="assignment in swapTargetTable.assignments"
          :key="assignment.assignment_id"
          class="swap-guest-item"
          @click="handleConfirmSwap(assignment)"
        >
          <div class="swap-guest-info">
            <strong>{{ formatAssignmentName(assignment) }}</strong>
            <el-tag size="small" :type="getAssignmentTypeColor(assignment.assignment_type)">
              {{ formatAssignmentType(assignment.assignment_type) }}
            </el-tag>
          </div>
          <el-icon><Switch /></el-icon>
        </div>
      </div>

      <template #footer v-if="swapStep === 'table'">
        <el-button @click="showSwapDialog = false">Cancel</el-button>
      </template>
    </el-dialog>

    <!-- Move to Table Dialog -->
    <el-dialog
      v-model="showMoveDialog"
      title="Move to Table"
      width="500px"
      @close="handleCloseMoveDialog"
    >
      <div v-if="selectedGuest" class="move-dialog-content">
        <div class="current-selection-info">
          <p class="info-text">
            <el-icon><InfoFilled /></el-icon>
            Moving: <strong>{{ formatAssignmentName(selectedGuest.assignment) }}</strong>
          </p>
          <p class="info-text secondary">
            From: Table {{ selectedGuest.table.table_number }}
          </p>
        </div>

        <div class="move-table-list">
          <p class="section-title">Select Target Table:</p>
          
          <el-empty
            v-if="sortedTables.filter(t => t.table_id !== selectedGuest?.table.table_id).length === 0"
            description="No other tables available"
            :image-size="80"
          />
          
          <div
            v-for="table in sortedTables.filter(t => t.table_id !== selectedGuest?.table.table_id)"
            :key="table.table_id"
            class="move-table-item"
            :class="{ 'table-full': table.available_count === 0 }"
            @click="table.available_count > 0 ? handleSelectMoveTable(table) : null"
          >
            <div class="move-table-info">
              <h4>Table {{ table.table_number }} {{ table.table_name ? `- ${table.table_name}` : '' }}</h4>
              <div class="table-capacity">
                <el-tag
                  :type="table.available_count > 0 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ table.assigned_count }}/{{ table.capacity }} seats
                </el-tag>
                <span v-if="table.available_count > 0" class="available-text">
                  {{ table.available_count }} available
                </span>
                <span v-else class="full-text">
                  Full
                </span>
              </div>
            </div>
            <el-icon v-if="table.available_count > 0"><ArrowRight /></el-icon>
            <el-icon v-else style="color: var(--el-text-color-disabled);"><Close /></el-icon>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="handleCloseMoveDialog" :disabled="movingInProgress">
          Cancel
        </el-button>
      </template>
    </el-dialog>

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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { More, Edit, Delete, Close, Search, Sort, ArrowRight, ArrowLeft, Switch, InfoFilled } from '@element-plus/icons-vue'
import { useSeatingStore } from '@/stores/seating'
import TableForm from '@/components/TableForm.vue'
import type { SeatingTable, Assignment } from '@/types/seating'
// DEBUG: Commented out for production
// import { checkDuplicateGuests } from '@/utils/checkDuplicates'

const seatingStore = useSeatingStore()

// State
const showTableForm = ref(false)
const showUnassignedDrawer = ref(false)
const selectedTable = ref<SeatingTable | undefined>()
const currentTable = ref<SeatingTable | undefined>()
const searchQuery = ref('')
const addingGuestId = ref<string | null>(null)
const removingGuestId = ref<string | null>(null)
const viewMode = ref('cards')
const viewOptions = [
  { label: 'Cards', value: 'cards' },
  { label: 'Floor Plan', value: 'floorplan' }
]

// Tooltip state
const tooltipVisible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const tooltipAssignment = ref<Assignment | null>(null)

// Guest actions state
const showGuestActionsMenu = ref(false)
const selectedGuest = ref<{ assignment: Assignment; table: SeatingTable } | null>(null)
const guestActionsPosition = ref({ x: 0, y: 0 })

// Swap state
const showSwapDialog = ref(false)
const swapStep = ref<'table' | 'guest'>('table')
const swapTargetTable = ref<SeatingTable | null>(null)
const swappingInProgress = ref(false)

// Move state
const showMoveDialog = ref(false)
const moveTargetTableNumber = ref('')
const movingInProgress = ref(false)

// Computed
// Helper function to group assignments so spouses and plus-ones are next to their primary guest
// This creates family units around the table
const groupAssignmentsByGuest = (assignments: Assignment[]): Assignment[] => {
  const grouped: Assignment[] = []
  const processed = new Set<string>()

  // First, sort by assigned_at to maintain chronological order
  // The database likely assigns spouse/plus-ones right after their primary guest
  const sorted = [...assignments].sort((a, b) => {
    return a.assigned_at.localeCompare(b.assigned_at)
  })

  // Build a map of guest_id to their related assignments
  const guestGroups = new Map<string, Assignment[]>()
  const orphanedPlusOnes: Assignment[] = []

  sorted.forEach(assignment => {
    if (assignment.assignment_type === 'primary_guest') {
      if (!guestGroups.has(assignment.id)) {
        guestGroups.set(assignment.id, [])
      }
      guestGroups.get(assignment.id)!.push(assignment)
    } else if (assignment.assignment_type === 'spouse') {
      // Spouse shares the same guest_id as primary guest
      if (!guestGroups.has(assignment.id)) {
        guestGroups.set(assignment.id, [])
      }
      guestGroups.get(assignment.id)!.push(assignment)
    } else if (assignment.assignment_type === 'plus_one') {
      // Plus-ones: Try to find their primary guest by checking proximity in sorted order
      // Look backwards in the sorted array to find the most recent primary guest
      const currentIndex = sorted.indexOf(assignment)
      let foundPrimaryGuest = false
      
      for (let i = currentIndex - 1; i >= 0; i--) {
        const prevAssignment = sorted[i]
        if (!prevAssignment) continue
        
        if (prevAssignment.assignment_type === 'primary_guest') {
          if (!guestGroups.has(prevAssignment.id)) {
            guestGroups.set(prevAssignment.id, [])
          }
          guestGroups.get(prevAssignment.id)!.push(assignment)
          foundPrimaryGuest = true
          break
        }
        // Stop searching if we hit another primary guest's group already processed
        if (prevAssignment.assignment_type === 'spouse') {
          if (guestGroups.has(prevAssignment.id)) {
            guestGroups.get(prevAssignment.id)!.push(assignment)
            foundPrimaryGuest = true
            break
          }
        }
      }
      
      if (!foundPrimaryGuest) {
        orphanedPlusOnes.push(assignment)
      }
    }
  })

  // Now build the grouped array: primary -> spouse -> plus-ones for each guest group
  guestGroups.forEach((groupAssignments) => {
    // Sort within the group: primary first, spouse second, plus-ones after
    groupAssignments.sort((a, b) => {
      const typeOrder = { primary_guest: 0, spouse: 1, plus_one: 2 }
      return (typeOrder[a.assignment_type] ?? 3) - (typeOrder[b.assignment_type] ?? 3)
    })
    
    groupAssignments.forEach(assignment => {
      grouped.push(assignment)
      processed.add(assignment.assignment_id)
    })
  })

  // Add any orphaned plus-ones at the end
  orphanedPlusOnes.forEach(assignment => {
    if (!processed.has(assignment.assignment_id)) {
      grouped.push(assignment)
      processed.add(assignment.assignment_id)
    }
  })

  return grouped
}

const sortedTables = computed(() => {
  const sorted = [...seatingStore.seatingArrangement].sort((a, b) => {
    return a.display_order - b.display_order
  })

  // Group assignments within each table so spouses/plus-ones are next to primary guests
  return sorted.map(table => ({
    ...table,
    assignments: groupAssignmentsByGuest(table.assignments)
  }))
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

    // Validation 1: Check if table has available capacity
    if (currentTable.value.available_count <= 0) {
      ElMessage.warning(`Table ${currentTable.value.table_number} is at full capacity`)
      return
    }

    // Validation 2: For guests with spouse, check if table has room for both
    const assignSpouse = guest.has_spouse && guest.type !== 'spouse'
    if (assignSpouse && currentTable.value.available_count < 2) {
      const confirmSingleAssign = await ElMessageBox.confirm(
        `This table only has ${currentTable.value.available_count} seat(s) available, but ${guest.name} has a spouse. Do you want to assign only ${guest.name} and place the spouse elsewhere?`,
        'Insufficient Capacity',
        {
          confirmButtonText: 'Assign Guest Only',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(() => false)
      
      if (!confirmSingleAssign) {
        addingGuestId.value = null
        return
      }
    }

    if (guest.type === 'plus_one') {
      await seatingStore.assignPlusOneToTable(guest.id, currentTable.value.table_id)
    } else {
      // For primary guests and spouses, we'll assign the guest
      // The backend RPC function will handle spouse assignment based on assignSpouse parameter
      const finalAssignSpouse = assignSpouse && currentTable.value.available_count >= 2
      await seatingStore.assignGuestToTable(guest.id, currentTable.value.table_id, finalAssignSpouse)
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
  
  // For spouses, use "Mrs." instead of the titles from the guest record
  if (assignment.assignment_type === 'spouse') {
    parts.push('Mrs.')
  } else if (assignment.name.titles && assignment.name.titles.length > 0) {
    parts.push(assignment.name.titles.join(' '))
  }
  
  // For spouses, use last name only (or first name if no last name)
  if (assignment.assignment_type === 'spouse') {
    const displayName = assignment.name.last_name || assignment.name.first_name
    parts.push(displayName)
  } else {
    // For primary guests and plus-ones, show full name
    parts.push(assignment.name.first_name)
    
    if (assignment.name.middle_name) {
      parts.push(assignment.name.middle_name)
    }
    
    if (assignment.name.last_name) {
      parts.push(assignment.name.last_name)
    }
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

// Floor plan helpers
const formatShortName = (assignment: Assignment) => {
  // For spouses, display as "Mrs. LastName" or "Mrs. FirstName" if no last name
  if (assignment.assignment_type === 'spouse') {
    const displayName = assignment.name.last_name || assignment.name.first_name
    return `Mrs. ${displayName}`
  }
  
  // For primary guests and plus-ones, use first name + last initial
  const firstName = assignment.name.first_name
  const lastName = assignment.name.last_name || ''
  return lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName
}

const getNameTagPosition = (index: number, total: number) => {
  // Start from top (0 degrees = 12 o'clock position)
  const angle = (index / total) * 360
  const radius = 70 // Distance from center (fits within 200px: 60px circle radius + 60px tag + margin)
  const radian = (angle * Math.PI) / 180
  const x = radius * Math.cos(radian)
  const y = radius * Math.sin(radian)
  
  // Rotate the vertical tag to point outward from center
  // The tag radiates from center with colored edge at bottom (toward center)
  const rotation = angle + 90
  
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`
  }
}

const getTooltipRotation = (index: number, total: number) => {
  // Counter-rotate the tooltip to keep it horizontal
  const angle = (index / total) * 360
  const rotation = angle + 90
  
  return {
    transform: `rotate(${-rotation}deg)`
  }
}

// Tooltip functions
const showTooltip = (event: MouseEvent, assignment: Assignment) => {
  tooltipAssignment.value = assignment
  tooltipVisible.value = true
  
  // Position tooltip near the mouse cursor
  const offset = 10
  tooltipPosition.value = {
    x: event.clientX + offset,
    y: event.clientY + offset
  }
}

const hideTooltip = () => {
  tooltipVisible.value = false
  tooltipAssignment.value = null
}

// Guest actions functions
const handleNameTagClick = (event: MouseEvent, assignment: Assignment, table: SeatingTable) => {
  event.stopPropagation()
  hideTooltip() // Hide tooltip when showing menu
  
  selectedGuest.value = { assignment, table }
  showGuestActionsMenu.value = true
  
  // Position menu near click
  guestActionsPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

const closeGuestActionsMenu = () => {
  showGuestActionsMenu.value = false
  selectedGuest.value = null
}

const handleMoveGuest = () => {
  if (!selectedGuest.value) return
  
  // Close menu but keep selectedGuest for the dialog
  showGuestActionsMenu.value = false
  moveTargetTableNumber.value = ''
  showMoveDialog.value = true
}

const handleStartSwap = () => {
  if (!selectedGuest.value) return
  
  // Close menu but keep selectedGuest for the dialog
  showGuestActionsMenu.value = false
  swapStep.value = 'table'
  swapTargetTable.value = null
  showSwapDialog.value = true
}

const handleRemoveFromMenu = async () => {
  if (!selectedGuest.value) return
  
  // Capture the guest data before closing menu
  const guestToRemove = selectedGuest.value
  closeGuestActionsMenu()
  
  try {
    await ElMessageBox.confirm(
      `Remove ${formatAssignmentName(guestToRemove.assignment)} from Table ${guestToRemove.table.table_number}?`,
      'Remove Guest',
      {
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    await seatingStore.removeAssignment(guestToRemove.assignment.assignment_id)
    ElMessage.success('Guest removed from table')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to remove assignment:', error)
    }
  }
}

const handleSelectSwapTable = (table: SeatingTable) => {
  swapTargetTable.value = table
  swapStep.value = 'guest'
}

const handleConfirmSwap = async (targetAssignment: Assignment) => {
  if (!selectedGuest.value || !swapTargetTable.value) return
  
  try {
    swappingInProgress.value = true
    
    const sourceAssignment = selectedGuest.value.assignment
    const sourceTable = selectedGuest.value.table
    
    // Validation 1: Cannot swap with yourself
    if (sourceAssignment.assignment_id === targetAssignment.assignment_id) {
      ElMessage.warning('Cannot swap a guest with themselves')
      return
    }
    
    // Validation 2: Check if swapping would violate spouse pairing rules
    if (sourceAssignment.assignment_type === 'spouse' || targetAssignment.assignment_type === 'spouse') {
      const confirmSpouseSwap = await ElMessageBox.confirm(
        'You are swapping a spouse assignment. This may separate spouses who were seated together. Continue?',
        'Confirm Spouse Swap',
        {
          confirmButtonText: 'Yes, Swap Anyway',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(() => false)
      
      if (!confirmSpouseSwap) return
    }
    
    // Validation 3: Warn if swapping between tables with different family sides
    const sourceFamilySide = sourceTable.assignments.find(a => a.family_side)?.family_side
    const targetFamilySide = swapTargetTable.value.assignments.find(a => a.family_side)?.family_side
    
    if (sourceFamilySide && targetFamilySide && sourceFamilySide !== targetFamilySide) {
      const confirmCrossSide = await ElMessageBox.confirm(
        `You are swapping guests between ${sourceFamilySide} and ${targetFamilySide} tables. Continue?`,
        'Cross-Family Swap',
        {
          confirmButtonText: 'Yes, Continue',
          cancelButtonText: 'Cancel',
          type: 'info'
        }
      ).catch(() => false)
      
      if (!confirmCrossSide) return
    }
    
    // Perform the swap
    await seatingStore.swapGuestsBetweenTables(
      sourceAssignment.assignment_id,
      targetAssignment.assignment_id
    )
    
    ElMessage.success(`Successfully swapped ${formatAssignmentName(sourceAssignment)} with ${formatAssignmentName(targetAssignment)}`)
    handleCloseSwapDialog()
  } catch (error) {
    console.error('Failed to swap guests:', error)
    ElMessage.error('Failed to swap guests')
  } finally {
    swappingInProgress.value = false
  }
}

const handleCloseSwapDialog = () => {
  showSwapDialog.value = false
  swapStep.value = 'table'
  swapTargetTable.value = null
  selectedGuest.value = null
}

const handleSelectMoveTable = async (targetTable: SeatingTable) => {
  if (!selectedGuest.value) return
  
  try {
    movingInProgress.value = true
    
    const sourceAssignment = selectedGuest.value.assignment
    const sourceTable = selectedGuest.value.table
    
    // Validation: Cannot move to the same table
    if (targetTable.table_id === sourceTable.table_id) {
      ElMessage.warning('Guest is already at this table')
      return
    }
    
    // Validation: Check if target table has capacity
    if (targetTable.available_count < 1) {
      ElMessage.error(`Table ${targetTable.table_number} is at full capacity`)
      return
    }
    
    // Use appropriate move function based on assignment type
    if (sourceAssignment.assignment_type === 'plus_one') {
      await seatingStore.movePlusOneToTable(sourceAssignment.id, targetTable.table_id)
    } else {
      // For primary guests and spouses
      // Check if we should move spouse as well (if it's a primary guest)
      const hasSpouse = sourceTable.assignments.some(
        a => a.assignment_type === 'spouse' && a.id === sourceAssignment.id
      )
      
      if (hasSpouse && sourceAssignment.assignment_type === 'primary_guest') {
        const confirmMoveSpouse = await ElMessageBox.confirm(
          `${formatAssignmentName(sourceAssignment)} has a spouse at this table. Move spouse as well?`,
          'Move Spouse',
          {
            confirmButtonText: 'Move Both',
            cancelButtonText: 'Move Guest Only',
            distinguishCancelAndClose: true,
            type: 'info'
          }
        ).catch(() => false)
        
        await seatingStore.moveGuestToTable(
          sourceAssignment.id,
          targetTable.table_id,
          !!confirmMoveSpouse
        )
      } else {
        await seatingStore.moveGuestToTable(sourceAssignment.id, targetTable.table_id, false)
      }
    }
    
    ElMessage.success(
      `Successfully moved ${formatAssignmentName(sourceAssignment)} to Table ${targetTable.table_number}`
    )
    handleCloseMoveDialog()
  } catch (error) {
    console.error('Failed to move guest:', error)
    // Error message already shown by store
  } finally {
    movingInProgress.value = false
  }
}

const handleCloseMoveDialog = () => {
  showMoveDialog.value = false
  moveTargetTableNumber.value = ''
  selectedGuest.value = null
}

// Close menus on click outside
const handleClickOutside = (event: MouseEvent) => {
  showGuestActionsMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Table positions based on the floor plan image (grid-based: 60 columns x 66 rows)
// Each table occupies 10x10 grid cells
const getTablePosition = (table: SeatingTable) => {
  const positions: Record<string, { column: number; row: number }> = {
    // Left side tables (top to bottom)
    '9': { column: 1, row: 6 },       // Top-left corner
    '21': { column: 2, row: 15 },     // Left side, upper
    '1': { column: 12, row: 12 },      // Left of dance floor, upper
    '11': { column: 3, row: 16 },     // Left side, middle
    '13': { column: 4, row: 26 },     // Left center
    '3': { column: 15, row: 22 },      // Left side, lower
    '5': { column: 17, row: 32 },      // Left side, bottom
    '15': { column: 7, row: 36 },     // Left side, bottom area
    '7': { column: 17, row: 43 },      // Left side, near bottom
    '17': { column: 7, row: 47 },     // Bottom-left
    
    // Right side tables (top to bottom)
    '10': { column: 51, row: 7 },     // Top-right corner
    '2': { column: 41, row: 11 },     // Right of dance floor, upper
    '12': { column: 50, row: 17 },    // Right side, upper middle
    '4': { column: 39, row: 21 },     // Right of dance floor, lower
    '14': { column: 47, row: 28 },    // Right side, middle
    '6': { column: 35, row: 31 },     // Right side, lower
    '16': { column: 45, row: 38 },    // Right side, bottom
    '8': { column: 35, row: 42 },     // Right side, bottom area
    '18': { column: 50, row: 48 },    // Bottom-right
    
    // Additional tables if needed
    '19': { column: 40, row: 51 },
    '20': { column: 47, row: 8 },
    '22': { column: 44, row: 22 },
  }
  
  const position = positions[table.table_number]
  if (!position) {
    return { gridColumn: '26 / 36', gridRow: '28 / 38' } // Default center position
  }
  
  return {
    gridColumn: `${position.column} / ${position.column + 10}`,
    gridRow: `${position.row} / ${position.row + 10}`
  }
}

// DEBUG: Commented out for production
// Utility function to check for duplicate guests
// const handleCheckDuplicates = async () => {
//   try {
//     await checkDuplicateGuests()
//   } catch (error) {
//     ElMessage.error('Failed to check for duplicates')
//   }
// }

// Lifecycle
onMounted(() => {
  seatingStore.fetchSeatingChart()
  
  // DEBUG: Commented out for production
  // Make checkDuplicates available in browser console for debugging
  // if (typeof window !== 'undefined') {
  //   (window as any).checkDuplicateGuests = handleCheckDuplicates
  //   console.log('💡 Tip: Run checkDuplicateGuests() in the console to check for duplicate guest names')
  // }
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

/* Floor Plan View Styles */
.floor-plan-container {
  flex: 1;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 24px;
  min-height: 0;
}

.floor-plan-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.legend-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.legend-box {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid;
}

.floor-plan {
  display: grid;
  grid-template-columns: repeat(60, 20px);
  grid-template-rows: repeat(66, 20px);
  width: 1200px;
  height: 1320px;
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  gap: 0;
  padding: 0;
  margin: 0 auto;
}

/* Stage */
.stage-area {
  grid-column: 21 / 41;
  grid-row: 1 / 13;
  background: linear-gradient(135deg, #e0e0e0 0%, #c8c8c8 100%);
  border: 2px solid #999;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.stage-label {
  font-size: 18px;
  font-weight: 600;
  color: #666;
}

/* Dance Floor */
.dance-floor {
  grid-column: 25 / 37;
  grid-row: 13 / 25;
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  border: 3px dashed #aaa;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.dance-floor-label {
  font-size: 16px;
  font-weight: 500;
  color: #888;
}

/* Walkway */
.walkway {
  grid-column: 28 / 34;
  grid-row: 25 / 53;
  background: linear-gradient(90deg, #e8e8e8 0%, #d8d8d8 100%);
  border: 2px solid #bbb;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.walkway-label {
  font-size: 14px;
  font-weight: 500;
  color: #777;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Tables */
.floor-plan-table {
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-center {
  text-align: center;
  z-index: 1;
}

.table-number-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.table-capacity {
  font-size: 11px;
  color: #666;
}

/* Name Tags - vertical rectangles radiating from center */
.name-tag {
  position: absolute;
  width: 30px;
  height: 60px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  box-sizing: border-box;
}

/* Colored edge indicator at bottom (closest to table center) */
.name-tag::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -2px;
  right: -2px;
  height: 10px;
  border-radius: 0 0 4px 4px;
}

.name-tag:hover {
  z-index: 9998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.name-tag-text {
  display: block;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  max-height: 100%;
}

/* Global Tooltip */
.global-tooltip {
  position: fixed;
  background: white;
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 200px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 99999;
  pointer-events: none;
  transform: translate(-50%, -100%) translateY(-10px);
}

.tooltip-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
  writing-mode: horizontal-tb;
  white-space: normal;
}

.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  writing-mode: horizontal-tb;
}

.tooltip-label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.tooltip-value {
  color: #333;
  flex: 1;
}

/* Assignment type color coding - colored edge indicator */
.assignment-primary_guest::after {
  background: #409eff;
}

.assignment-spouse::after {
  background: #67c23a;
}

.assignment-plus_one::after {
  background: #e6a23c;
}

.empty-seat {
  border-style: dashed;
  border-color: #dcdfe6;
  background: #f5f7fa;
  color: #909399;
}

.empty-seat::after {
  background: #dcdfe6;
}

.empty-seat:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* Swap Dialog Styles */
.current-selection-info {
  padding: 12px;
  background: var(--el-color-info-light-9);
  border-radius: 8px;
  margin-bottom: 16px;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.swap-table-list,
.swap-guest-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.swap-table-item,
.swap-guest-item {
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.swap-table-item:hover,
.swap-guest-item:hover {
  background: var(--el-fill-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.swap-table-info,
.swap-guest-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.swap-table-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.guest-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.selected-table-info {
  padding: 12px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  margin-bottom: 16px;
}

.selected-table-info h4 {
  margin: 0;
  font-size: 15px;
  color: var(--el-text-color-primary);
}

.back-button {
  margin-bottom: 12px;
}

/* Guest Actions Menu */
.guest-actions-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 99999;
  overflow: hidden;
}

.menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 14px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background: var(--el-fill-color-light);
}

.menu-item.danger {
  color: var(--el-color-danger);
}

.menu-item.danger:hover {
  background: var(--el-color-danger-light-9);
}

/* Move Dialog Styles */
.move-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-text.secondary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.move-table-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.move-table-item {
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.move-table-item:hover:not(.table-full) {
  background: var(--el-fill-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary);
}

.move-table-item.table-full {
  cursor: not-allowed;
  opacity: 0.6;
  background: var(--el-fill-color-lighter);
}

.move-table-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.move-table-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.table-capacity {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.available-text {
  color: var(--el-color-success);
  font-weight: 500;
}

.full-text {
  color: var(--el-color-danger);
  font-weight: 500;
}
</style>