<template>
  <div class="guests-view">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>Guest List</h1>
        <p class="description">
          Manage your wedding guests and their invitations
        </p>
      </div>
      <div class="action-buttons">
        <el-button 
          v-if="authStore.featureAccess.canCreateGuests"
          type="primary" 
          @click="handleAddNewGuest"
        >
          {{ guestStore.hasGuests ? 'Add New Guest' : 'Add First Guest' }}
        </el-button>
        <el-tooltip
          v-else
          content="You don't have permission to add guests"
          placement="top"
        >
          <el-button type="primary" disabled>
            {{ guestStore.hasGuests ? 'Add New Guest' : 'Add First Guest' }}
          </el-button>
        </el-tooltip>

        <el-button
          v-if="authStore.featureAccess.canCreateGuests"
          @click="showImportDialog = true"
        >
          Import from CSV
        </el-button>
        <el-tooltip
          v-else
          content="You don't have permission to import guests"
          placement="top"
        >
          <el-button disabled>
            Import from CSV
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-if="!guestStore.hasGuests" description="Start building your guest list" />

    <!-- Main Content -->
    <template v-else>
      <!-- Filters -->
      <div class="filters">
        <div class="quick-filters">
          <el-radio-group v-model="guestStore.filterAttendance">
            <el-radio-button label="all">All</el-radio-button>
            <el-radio-button label="attending">Attending</el-radio-button>
            <el-radio-button label="not_attending">Not Attending</el-radio-button>
          </el-radio-group>
        </div>

        <div class="advanced-filters">
          <el-select v-model="guestStore.filterCategory" placeholder="Category" clearable>
            <el-option label="All Categories" value="all" />
            <el-option label="Family" value="family" />
            <el-option label="Friends" value="friends" />
            <el-option label="Asoebi" value="asoebi" />
          </el-select>

          <el-button @click="resetFilters">Clear Filters</el-button>
        </div>
      </div>

      <!-- Guest Table -->
      <el-table
        v-loading="guestStore.loading"
        :data="guestStore.filteredGuests"
        class="guest-table"
      >
        <!-- Guest Details -->
        <el-table-column label="Guest Details" min-width="80">
          <template #default="{ row }">
            <div class="guest-details">
              <span class="guest-name">
                {{ formatGuestName(row) }}
              </span>
              <el-tag class="guest-tag" size="small" :type="getCategoryType(row.guest_category)">
                {{ row.guest_category }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Spouse/+1 Details -->
        <el-table-column label="Plus One Details" width="200">
          <template #default="{ row }">
            <template v-if="row.plus_one_eligibility === 'eligible'">
              <div v-if="row.rsvp?.plus_one_name" class="plus-one-details">
                <span>{{ row.rsvp.plus_one_name }}</span>
                <div class="plus-one-actions">
                  <el-button 
                    link
                    type="primary"
                    size="small"
                    @click="handleEditPlusOne(row)"
                  >
                    Edit
                  </el-button>
                  <el-button 
                    link
                    type="danger"
                    size="small"
                    @click="handleRemovePlusOne(row)"
                  >
                    Remove
                  </el-button>
                </div>
              </div>
              <el-button 
                v-else-if="row.rsvp?.attendance_status === 'attending'"
                link
                type="primary"
                @click="handleAddPlusOne(row)"
              >
                Add Plus One
              </el-button>
            </template>
            <span v-else>Not Eligible</span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip
                content="Copy Invite Link"
                placement="top"
                :disabled="!authStore.hasFeatureAccess('edit_rsvp_responses')"
              >
                <el-button
                  circle
                  size="small"
                  :type="authStore.hasFeatureAccess('edit_rsvp_responses') ? 'primary' : 'info'"
                  :disabled="!authStore.hasFeatureAccess('edit_rsvp_responses')"
                  @click="handleCopyInviteLink(row)"
                >
                  <el-icon><Link /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Update RSVP Status"
                placement="top"
                :disabled="!authStore.hasFeatureAccess('edit_rsvp_responses')"
              >
                <el-button
                  circle
                  size="small"
                  :type="authStore.hasFeatureAccess('edit_rsvp_responses') ? 'success' : 'info'"
                  :disabled="!authStore.hasFeatureAccess('edit_rsvp_responses')"
                  @click="handleUpdateStatus(row)"
                >
                  <el-icon><Check /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Edit Guest"
                placement="top"
                :disabled="!authStore.featureAccess.canEditGuests"
              >
                <el-button
                  circle
                  size="small"
                  :type="authStore.featureAccess.canEditGuests ? 'warning' : 'info'"
                  :disabled="!authStore.featureAccess.canEditGuests"
                  @click="handleEditGuest(row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Remove Guest"
                placement="top"
                :disabled="!authStore.featureAccess.canDeleteGuests"
              >
                <el-button
                  circle
                  size="small"
                  :type="authStore.featureAccess.canDeleteGuests ? 'danger' : 'info'"
                  :disabled="!authStore.featureAccess.canDeleteGuests"
                  @click="handleDeleteGuest(row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="guestStore.totalGuests"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>

    <!-- Guest Form Dialog -->
    <GuestForm
      v-model="showGuestForm"
      :initial-data="selectedGuest"
      @submit="handleGuestSubmit"
    />

    <!-- Import Dialog -->
    <GuestImportDialog
      v-model="showImportDialog"
      :existing-guests="guestStore.guests"
      @import="handleGuestImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useGuestStore } from '@/stores/guest'
import { useAuthStore } from '@/stores/auth'
import GuestForm from '@/components/GuestForm.vue'
import GuestImportDialog from '@/components/GuestImportDialog.vue'
import { Link, Edit, Delete, Check, UserFilled } from '@element-plus/icons-vue'
import type { Guest, GuestWithRSVP, GuestCategory, AttendanceStatus, RSVP } from '@/types/guest'

const authStore = useAuthStore()

const guestStore = useGuestStore()
const showGuestForm = ref(false)
const showImportDialog = ref(false)
const selectedGuest = ref<Guest | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const importLoading = ref(false)

// Fetch guests on mount
onMounted(() => {
  console.log(guestStore.guests)
  guestStore.fetchGuests(currentPage.value, pageSize.value)
})

// Utility functions
const formatGuestName = (guest: GuestWithRSVP) => {
  return guest.guest_type === 'couple' ? `Mr. & Mrs. ${guest.name}` : guest.name
}

const getCategoryType = (category: GuestCategory): 'success' | 'warning' | 'info' => {
  const types: Record<GuestCategory, 'success' | 'warning' | 'info'> = {
    family: 'success',
    friend: 'warning',
    asoebi: 'info',
    bestman: 'success',
    chiefbridesmaid: 'warning'
  }
  return types[category]
}

const getStatusType = (guest: GuestWithRSVP): 'success' | 'danger' | 'info' => {
  const status = guest.rsvp?.attendance_status ?? 'pending'
  const types: Record<'attending' | 'not_attending' | 'pending', 'success' | 'danger' | 'info'> = {
    attending: 'success',
    not_attending: 'danger',
    pending: 'info'
  }
  return types[status]
}

const getStatusText = (guest: GuestWithRSVP) => {
  const status = guest.rsvp?.attendance_status ?? 'pending'
  if (status === 'attending' && guest.guest_type === 'couple') {
    return guest.rsvp?.spouse_attending ? 'Both Attending' : 'Attending'
  }
  return {
    attending: 'Attending',
    not_attending: 'Not Attending',
    pending: 'Pending'
  }[status]
}

// Event handlers
const handleGuestSubmit = async (formData: Omit<Guest, 'guest_id' | 'auth_token' | 'created_by'>) => {
  try {
    if (selectedGuest.value?.guest_id) {
      await guestStore.updateGuest(selectedGuest.value.guest_id, formData)
    } else {
      await guestStore.createGuest(formData)
    }
    showGuestForm.value = false
    selectedGuest.value = null
  } catch (error) {
    console.error('Failed to save guest:', error)
  }
}

const handleEditGuest = (guest: Guest) => {
  console.log('🎯 handleEditGuest called with:', guest)
  selectedGuest.value = guest
  console.log('🎯 selectedGuest.value set to:', selectedGuest.value)
  showGuestForm.value = true
  console.log('🎯 showGuestForm.value set to:', showGuestForm.value)
}

const handleDeleteGuest = async (guest: Guest) => {
    console.log('Guest data:', guest)
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to remove this guest?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
    await guestStore.deleteGuest(guest.guest_id)
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleAddPlusOne = async (guest: GuestWithRSVP) => {
  if (!guest.rsvp?.rsvp_id) return

  const name = await ElMessageBox.prompt(
    'Enter the name of the plus one',
    'Add Plus One',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => !!value.trim() || 'Please enter a name'
    }
  )

  if (name.action === 'confirm') {
    await guestStore.updateRSVP(guest.rsvp.rsvp_id, {
      plus_one_name: name.value.trim(),
      plus_one_attending: true
    })
  }
}

const handleEditPlusOne = async (guest: GuestWithRSVP) => {
  if (!guest.rsvp?.rsvp_id || !guest.rsvp.plus_one_name) return

  try {
    const name = await ElMessageBox.prompt(
      'Edit plus one name',
      'Edit Plus One',
      {
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        inputValue: guest.rsvp.plus_one_name,
        inputValidator: (value) => !!value.trim() || 'Please enter a name'
      }
    )

    if (name.action === 'confirm' && name.value !== guest.rsvp.plus_one_name) {
      await guestStore.updateRSVP(guest.rsvp.rsvp_id, {
        plus_one_name: name.value.trim()
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to edit plus one:', error)
      ElMessage.error('Failed to edit plus one')
    }
  }
}

const handleRemovePlusOne = async (guest: GuestWithRSVP) => {
  if (!guest.rsvp?.rsvp_id || !guest.rsvp.plus_one_name) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to remove ${guest.rsvp.plus_one_name} as plus one?`,
      'Remove Plus One',
      {
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'No, Keep',
        type: 'warning'
      }
    )

    await guestStore.updateRSVP(guest.rsvp.rsvp_id, {
      plus_one_name: null,
      plus_one_attending: null
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to remove plus one:', error)
      ElMessage.error('Failed to remove plus one')
    }
  }
}

const handleCopyInviteLink = async (guest: Guest) => {
  const guestAppUrl = import.meta.env.VITE_GUEST_APP_URL
  const inviteLink = `${guestAppUrl}/${guest.auth_token}`
  
  try {
    await navigator.clipboard.writeText(inviteLink)
    ElMessage.success('Invite link copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
    ElMessage.error('Failed to copy invite link')
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  guestStore.fetchGuests(currentPage.value, size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  guestStore.fetchGuests(page, pageSize.value)
}

const resetFilters = () => {
  guestStore.filterAttendance = 'all'
  guestStore.filterCategory = 'all'
}

// Handle status update
const handleUpdateStatus = async (guest: GuestWithRSVP) => {
  console.log('🔄 handleUpdateStatus: Starting with guest:', {
    id: guest.guest_id,
    name: guest.name,
    currentRsvp: guest.rsvp
  })

  const currentStatus = guest.rsvp?.attendance_status || 'pending'
  console.log('📋 Current status:', currentStatus)

  try {
    console.log('💬 Showing status selection dialog')
    let newStatus: AttendanceStatus = currentStatus
    let spouseAttending: boolean | undefined = undefined

    const isCouple = guest.guest_type === 'couple'
    console.log('👥 Guest type:', guest.guest_type)

    if (isCouple) {
      try {
        const action = await ElMessageBox.confirm(
          `Change status for ${guest.name}\nCurrent status: ${currentStatus}`,
          'Update RSVP Status',
          {
            confirmButtonText: 'Attending',
            cancelButtonText: 'Not Attending',
            distinguishCancelAndClose: true,
            showClose: true,
            showCancelButton: true,
            type: 'info'
          }
        )
        
        if (action === 'confirm') {
          // If attending, ask about spouse attendance
          try {
            const spouseAction = await ElMessageBox.confirm(
              'Will both be attending?',
              'Spouse Attendance',
              {
                confirmButtonText: 'Yes, Attending with Spouse',
                cancelButtonText: 'No, Attending Alone',
                type: 'info',
                showClose: true
              }
            )
            newStatus = 'attending'
            spouseAttending = true // Both attending
            console.log('👥 Both attending')
          } catch (err) {
            if (err === 'cancel') {
              newStatus = 'attending'
              spouseAttending = false // Attending alone
              console.log('👤 Attending alone')
            } else if (err === 'close') {
              // User closed dialog, cancel operation
              return
            } else {
              throw err
            }
          }
        }
        console.log('👆 User clicked Attending button, spouse attending:', spouseAttending)
      } catch (action: any) {
        if (action === 'cancel') {
          newStatus = 'not_attending'
          spouseAttending = false
          console.log('👆 User clicked Not Attending button')
        } else if (action === 'close') {
          newStatus = 'pending'
          console.log('👆 User clicked Close button')
        } else {
          throw action
        }
      }
    } else {
      // Single guest flow
      try {
        await ElMessageBox.confirm(
          `Change status for ${guest.name}\nCurrent status: ${currentStatus}`,
          'Update RSVP Status',
          {
            confirmButtonText: 'Mark as Attending',
            cancelButtonText: 'Mark as Not Attending',
            distinguishCancelAndClose: true,
            showClose: true,
            type: 'info'
          }
        )
        newStatus = 'attending'
        console.log('👆 User clicked Attending button')
      } catch (action: any) {
        if (action === 'cancel') {
          newStatus = 'not_attending'
          console.log('👆 User clicked Not Attending button')
        } else if (action === 'close') {
          newStatus = 'pending'
          console.log('👆 User clicked Close button')
        } else {
          throw action
        }
      }
    }

    console.log('🎯 Selected new status:', newStatus)

    const shouldUpdate = 
      newStatus !== currentStatus || 
      (guest.guest_type === 'couple' && spouseAttending !== undefined && spouseAttending !== guest.rsvp?.spouse_attending)

    if (shouldUpdate) {
      console.log('📝 Updating RSVP status:', {
        guestId: guest.guest_id,
        oldStatus: currentStatus,
        newStatus: newStatus,
        spouseAttending: spouseAttending
      })

      if(!guest.rsvp?.rsvp_id) {
        console.warn('⚠️ No existing RSVP found, cannot update status')
        ElMessage.error('No existing RSVP found for this guest')
        return
      }

      const updates: Partial<RSVP> = {
        attendance_status: newStatus
      }

      if (guest.guest_type === 'couple' && spouseAttending !== undefined) {
        updates.spouse_attending = spouseAttending
      }

      await guestStore.updateRSVP(guest.rsvp.rsvp_id, updates)

      /* if (guest.rsvp?.rsvp_id) {
        await guestStore.updateRSVP(guest.rsvp.rsvp_id, updates)
      } else {
        await guestStore.createOrUpdateRSVP(guest.guest_id, newStatus, spouseAttending)
      } */
      console.log('✅ RSVP status update completed')
    } else {
      console.log('ℹ️ Status unchanged, skipping update')
    }
  } catch (error) {
    console.error('❌ Failed to update status:', error)
    ElMessage.error('Failed to update RSVP status')
  } finally {
    console.log('🏁 handleUpdateStatus: Operation completed')
  }
}

// Handle CSV import
const handleGuestImport = async (guestsToImport: Partial<Guest>[]) => {
  try {
    importLoading.value = true
    
    // Create guests one by one to handle errors gracefully
    let successCount = 0
    let errorCount = 0

    for (const guestData of guestsToImport) {
      // Ensure all required fields are present
      if (!guestData.name || !guestData.guest_type || !guestData.guest_category) {
        console.error('Missing required fields:', guestData)
        errorCount++
        continue
      }

      // Create a properly typed guest object
      const guest: Omit<Guest, 'guest_id' | 'auth_token' | 'created_by'> = {
        name: guestData.name,
        guest_type: guestData.guest_type,
        guest_category: guestData.guest_category,
        plus_one_eligibility: guestData.plus_one_eligibility ?? 'not_eligible',
        invitation_type: 'rsvp_guest',
        invitation_method: 'digital'
      }

      try {
        await guestStore.createGuest(guest)
        successCount++
      } catch (error) {
        console.error('Failed to import guest:', guest, error)
        errorCount++
      }
    }

    // Show import results
    if (successCount > 0) {
      ElMessage.success(`Successfully imported ${successCount} guests`)
    }
    if (errorCount > 0) {
      ElMessage.warning(`Failed to import ${errorCount} guests`)
    }

    // Refresh the guest list
    await guestStore.fetchGuests(currentPage.value, pageSize.value)
  } catch (error) {
    console.error('Import error:', error)
    ElMessage.error('Failed to import guests')
  } finally {
    importLoading.value = false
  }
}

// Function to handle adding a new guest
const handleAddNewGuest = () => {
  console.log('➕ Opening form for new guest')
  selectedGuest.value = null // Clear any previously selected guest
  showGuestForm.value = true
}
</script>

<style scoped>
.guests-view {
  padding: 40px 40px 0 40px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* height: 100%; */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.description {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.header .action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-shrink: 0;
}

.advanced-filters {
  display: flex;
  gap: 12px;
}

.guest-table {
  height: 100%;
}


.guest-details {
  display: flex;
  gap: 4px;
}

.guest-name {
  font-weight: 500;
}

.guest-tag {
  flex: none;
  width: auto;
}

.plus-one-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plus-one-details span {
  font-weight: 500;
}

.plus-one-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-buttons .el-button {
  padding: 6px;
}

.pagination {
  /* margin-top: 20px; */
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  /* border-top: 1px solid var(--el-border-color); */
  /* background-color: var(--el-bg-color); */
  flex-shrink: 0;
}
</style>
