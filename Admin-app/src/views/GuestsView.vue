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
          type="primary" 
          @click="handleAddNewGuest"
        >
          {{ guestStore.hasGuests ? 'Add New Guest' : 'Add First Guest' }}
        </el-button>

        <el-button
          @click="showImportDialog = true"
        >
          Import from CSV
        </el-button>

        <!-- <el-button
          @click="handleSync"
        >
          Sync Invitation Links
        </el-button> -->
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-if="!guestStore.hasGuests" description="Start building your guest list" />

    <!-- Main Content -->
    <template v-else>
      <!-- Filters -->
      <div v-if="!isBulkEditing" class="filters">
        <div>
          <el-button icon="" @click="showFilterDrawer = true">Advanced Filters</el-button>
        </div>

        <el-pagination
          v-model:current-page="guestStore.currentPage"
          v-model:page-size="guestStore.pageSize"
          :total="guestStore.totalGuests"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChangeWithScroll"
          @current-change="handleCurrentChangeWithScroll"
        />

        <el-drawer
          title="Advanced Filters"
          v-model:visible="showFilterDrawer"
          direction="rtl"
          size="420px"
        >
          <div class="advanced-filters-drawer">
            <el-select v-model="selectedFilters.guest_category" placeholder="Category" clearable multiple style="width:100%; margin-bottom:12px">
              <el-option label="Family" value="family" />
              <el-option label="Friend" value="friend" />
              <el-option label="Asoebi" value="asoebi" />
              <el-option label="Bestman" value="bestman" />
              <el-option label="Chief Bridesmaid" value="chiefbridesmaid" />
            </el-select>

            <el-select v-model="selectedFilters.attendance_status" placeholder="Attendance" clearable multiple style="width:100%; margin-bottom:12px">
              <el-option label="Attending" value="attending" />
              <el-option label="Not Attending" value="not_attending" />
              <el-option label="Pending" value="pending" />
            </el-select>

            <el-select v-model="selectedFilters.family_side" placeholder="Family Side" clearable multiple style="width:100%; margin-bottom:12px">
              <el-option label="Bride's Family" value="bride" />
              <el-option label="Groom's Family" value="groom" />
              <el-option label="Both" value="both" />
            </el-select>

            <el-select v-model="selectedFilters.invitation_type" placeholder="Invitation Type" clearable multiple style="width:100%; margin-bottom:12px">
              <el-option label="RSVP" value="rsvp_guest" />
              <el-option label="Information Only" value="information_only" />
            </el-select>

            <el-select v-model="selectedFilters.plus_one_eligibility" placeholder="Plus One Eligibility" clearable multiple style="width:100%; margin-bottom:12px">
              <el-option label="Eligible" value="eligible" />
              <el-option label="Not Eligible" value="not_eligible" />
            </el-select>

            <el-select v-model="selectedFilters.invite_sent" placeholder="Invite Sent" clearable style="width:100%; margin-bottom:12px">
              <el-option label="All" :value="'all'" />
              <el-option label="Sent" :value="true" />
              <el-option label="Not Sent" :value="false" />
            </el-select>

            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px">
              <el-button @click="resetFilters">Clear</el-button>
              <el-button type="primary" @click="handleApplyFromDrawer">Apply</el-button>
            </div>
          </div>
        </el-drawer>
      </div>

      <div v-else class="bulk-action-buttons">
        <el-select :empty-values="[null, undefined]" placeholder="Mark Invite as:" style="width: 200px">
          <el-option label="Sent" value="sent" />
          <el-option label="Not Sent" value="not_sent" />
        </el-select>

        <el-select :empty-values="[null, undefined]" placeholder="Set Status to:" style="width: 200px">
          <el-option value="attending" label="Attending" />
          <el-option value="not_attending" label="Not Attending" />
          <el-option value="spouse_attending" label="Attending with Spouse" />
          <el-option value="pending" label="Pending" />
        </el-select>

        <el-select :empty-values="[null, undefined]" placeholder="Set Category to:" style="width: 200px">
          <el-option value="family" label="Family" />
          <el-option value="friend" label="Friend" />
          <el-option value="asoebi" label="Asoebi" />
        </el-select>

        <el-button :icon="Link">Generate Invitation {{ selectedTableItems?.length === 1 ? 'Link' : 'Links' }}</el-button>
        <el-button :icon="Delete" type="danger" plain>Delete {{ selectedTableItems?.length === 1 ? 'Guest' : 'Guests' }}</el-button>
      </div>

      <el-table ref="guestTable" :data="guestTableData" v-loading="guestStore.loading" row-key="id" @selection-change="handleSelection">
        <el-table-column type="selection" width="48" />
        <el-table-column fixed label="Name" prop="name" width="300" />
        <el-table-column label="Status" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.id)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Category" prop="category" min-width="150" />
        <el-table-column label="Family" prop="family" min-width="150" />
        <el-table-column label="Class" prop="class" min-width="150" />
        <el-table-column label="Plus One" prop="plus_ones" min-width="150" />
        <el-table-column label="Actions" width="350" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip
                v-if="row.can_add_plus_one"
                content="Manage Plus Ones"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  @click="row.actions.managePlusOnes()"
                >
                  <el-icon><User /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Update RSVP Status"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  @click="row.actions.updateStatus()"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Mark as sent"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  :type="row.invite_sent ? 'success' : 'default'"
                  @click="row.actions.markAsSent()"
                >
                  <el-icon><Position /></el-icon>
                </el-button>
              </el-tooltip>
              

              <el-tooltip
                v-if="row.invitation_link"
                content="Copy Invite Link"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  @click="row.actions.copyLink()"
                >
                  <el-icon><Link /></el-icon>
                </el-button>
              </el-tooltip>
              
              <el-tooltip
                v-else
                content="generate Invite Link"
                placement="top"
                :show-after="500"
              >
                <el-button
                  :icon="Link"
                  plain
                  @click="row.actions.generateLink()"
                >Get Invite Link</el-button>
              </el-tooltip>

              <el-tooltip
                content="Edit Guest"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  @click="row.actions.edit()"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                content="Remove Guest"
                placement="top"
                :show-after="500"
              >
                <el-button
                  circle
                  type="danger"
                  plain
                  @click="row.actions.delete()"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- Guest Form Dialog -->
    <GuestForm
      v-model="showGuestForm"
      :initial-data="selectedGuest"
      :loading="guestFormLoading"
      @submit="handleGuestSubmit"
      @close="showGuestForm = false"
    />

    <!-- Plus One Management -->
    <PlusOneForm
      v-model="managePlusOne"
      :id="selectedGuest?.guest_id"
      @close="managePlusOne = false"
      @save="handlePlusOneDataSave"
      :loading="plusOneSaving"
    />

    <!-- Import Dialog -->
    <!-- <GuestImportDialog
      v-model="showImportDialog"
      :existing-guests="guestStore.guests.map(guest => guest)"
      @import="handleGuestImport"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useGuestStore } from '@/stores/guest'
import { useAuthStore } from '@/stores/auth'
// import { useInvitationLinks } from '@/composables/useInvitationLinks'
import GuestForm from '@/components/GuestForm.vue'
import PlusOneForm from '@/components/PlusOneForm.vue'
import GuestImportDialog from '@/components/GuestImportDialog.vue'
import { Link, Edit, Delete, Check, User, Message, Position, Plus, Refresh } from '@element-plus/icons-vue'
import type { Guest, GuestCategory, AttendanceStatus, RSVP, GuestTableRow } from '@/types/guest'

const authStore = useAuthStore()
const guestStore = useGuestStore()
// const invitationLinks = useInvitationLinks()

const showGuestForm = ref(false)
const showImportDialog = ref(false)
const selectedGuest = ref<GuestTableRow | null>(null)
const importLoading = ref(false)
const guestTable = ref<any>(null)
const isBulkEditing = ref<boolean>(false)
const selectedTableItems = ref<GuestTableRow[] | null>(null)
const managePlusOne = ref<boolean>(false)
const guestFormLoading = ref<boolean>(false)
const plusOneSaving = ref<boolean>(false)
const showFilterDrawer = ref<boolean>(false)

// Filters
const filterAttendance = ref<AttendanceStatus | 'all'>('all')
const filterCategory = ref<GuestCategory | 'all'>('all')

// Advanced filter selections (local state)
const selectedFilters = ref<{
  guest_category?: string[]
  attendance_status?: string[]
  family_side?: string[]
  invitation_type?: string[]
  plus_one_eligibility?: string[]
  invite_sent?: any
}>({
  guest_category: [],
  attendance_status: [],
  family_side: [],
  invitation_type: [],
  plus_one_eligibility: [],
  invite_sent: 'all'
})

const applyFilters = async () => {
  // Build payload mapping to view columns
  const payload: any = {}
  if (selectedFilters.value.guest_category && selectedFilters.value.guest_category.length > 0) payload.guest_category = selectedFilters.value.guest_category
  if (selectedFilters.value.attendance_status && selectedFilters.value.attendance_status.length > 0) payload.attendance_status = selectedFilters.value.attendance_status
  if (selectedFilters.value.family_side && selectedFilters.value.family_side.length > 0) payload.family_side = selectedFilters.value.family_side
  if (selectedFilters.value.invitation_type && selectedFilters.value.invitation_type.length > 0) payload.invitation_type = selectedFilters.value.invitation_type
  if (selectedFilters.value.plus_one_eligibility && selectedFilters.value.plus_one_eligibility.length > 0) payload.plus_one_eligibility = selectedFilters.value.plus_one_eligibility
  if (typeof selectedFilters.value.invite_sent !== 'undefined') payload.invite_sent = selectedFilters.value.invite_sent

  await guestStore.fetchGuests(currentPage.value, pageSize.value, payload)
}

const handleApplyFromDrawer = async () => {
  showFilterDrawer.value = false
  guestStore.currentPage = 1
  await applyFilters()
}


/* ----------------------------------- Computed Properties ---------------------------------- */
const guestTableData = computed(() => {
  const guests = [...guestStore.guests];
  const remappedGuests = guests.map(guest => {
    return {
      id: guest.guest_id,
      name: formatGuestName(guest),
      category: formatGuestCategory(guest),
      family: formatGuestFamilySide(guest),
      status: formatGuestStatus(guest),
      class: formatGuestClass(guest),
      plus_ones: formatGuestPlusOneEligibility(guest),
      invitation_link: guest.invitation_link,
      invite_sent: guest.invite_sent,
      can_add_plus_one: checkPlusOneEligibility(guest),
      actions: {
        edit: () => handleEditGuest(guest.guest_id),
        delete: () => handleDeleteGuest(guest.guest_id),
        updateStatus: () => handleUpdateStatus(guest.guest_id),
        generateLink: () => handleGenerateInviteLink(guest.guest_id),
        markAsSent: () => markAsSent(guest.guest_id),
        copyLink: () => handleCopyInviteLink(guest.guest_id),
        managePlusOnes: () => handleManagePlusOnes(guest.guest_id, guest)
      }
    }
  })

  return remappedGuests
})


/* ------------------------------------------ Methods -------------------------------------- */
const formatGuestName = (guest: GuestTableRow) => {
  const guestType = guest?.guest_type
  const title = (() => {
    const t = guest?.name?.titles
    const titles: unknown[] = Array.isArray(t) ? t : (t ? [t] : [])
    return titles
      .map(x => String(x ?? '').trim())
      .filter(Boolean)
      .join(' ')
  })()
  const suffix = (() => {
    const t = guest?.name?.suffixes
    const suffixes: unknown[] = Array.isArray(t) ? t : (t ? [t] : [])
    return suffixes
      .map(x => String(x ?? '').trim())
      .filter(Boolean)
      .join(' ')
  })()
  const firstName = guest?.name?.first_name
  const lastName = guest?.name?.last_name
  return guestType === 'couple' ? `${title ? title : 'Mr.'} & Mrs. ${firstName} ${lastName ? lastName : ''} ${suffix ? suffix : ''}` : `${title} ${firstName} ${lastName ? lastName : ''} ${suffix ? suffix : ''}`
}

const formatGuestStatus = (guest: GuestTableRow) => {
  const status = (guest?.rsvp_status ?? 'pending') as AttendanceStatus

  if (status === 'attending' && guest?.guest_type === 'couple') {
    return guest.spouse_rsvp_status ? 'Both With Spouse' : 'Attending Without Spouse'
  }

  const mappedStatus: Record<AttendanceStatus, string> = {
    attending: 'Attending',
    not_attending: 'Not Attending',
    pending: 'Pending'
  }

  return mappedStatus[status]
}

const formatGuestFamilySide = (guest: GuestTableRow) => {
  const side = guest?.family_side ?? 'unknown'

  const mappedFamilySide: Record<string, string> = {
    bride: 'Bride\'s Family',
    groom: 'Groom\'s Family',
    both: 'Both Families',
    unknown: 'Unknown'
  }

  return mappedFamilySide[side] || 'Unknown'
}

const formatGuestPlusOneEligibility = (guest: GuestTableRow) => {
  const isEligible = guest?.plus_one_eligibility === 'eligible'
  const plusOneCount = `${guest?.total_plus_ones ?? 0} / ${guest?.plus_one_limit ?? 0}`

  return isEligible ? plusOneCount : 'Not Eligible'
}

const formatGuestCategory = (guest: GuestTableRow) => {
  const category = guest?.guest_category

  const mappedCategory: Record<string, string> = {
    family: 'Family',
    friend: 'Friend',
    asoebi: 'Asoebi',
    bestman: 'Bestman',
    chiefbridesmaid: 'Chief Bridesmaid',
  }

  return mappedCategory[category]
}

const formatGuestClass = (guest: GuestTableRow) => {
  const guestClass = guest?.invitation_type

  const mappedClass: Record<string, string> = {
    information_only: 'Information Only',
    rsvp_guest: 'RSVP'
  }

  return mappedClass[guestClass]
}

const checkPlusOneEligibility = (guest: GuestTableRow) => {
  return guest?.plus_one_eligibility === 'eligible'
}

const getStatusType = (guestID: string): 'success' | 'danger' | 'info' => {
  const guest = guestStore.guests.find(guest => guest.guest_id === guestID)
  const status = (guest?.rsvp_status ?? 'pending') as AttendanceStatus
  const types: Record<'attending' | 'not_attending' | 'pending', 'success' | 'danger' | 'info'> = {
    attending: 'success',
    not_attending: 'danger',
    pending: 'info'
  }
  return types[status]
}

const handleSelection = (data: any) => {
  if(data.length > 0) {
    isBulkEditing.value = true
    selectedTableItems.value = data
  }else {
    isBulkEditing.value = false
    selectedTableItems.value = null
  }
}

const handleEditGuest = (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return
  
  selectedGuest.value = guest 
  showGuestForm.value = true
}

const handleDeleteGuest = async (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return

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
    await guestStore.deleteGuest(guestID)
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleUpdateStatus = async (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return

  const currentStatus = guest.rsvp_status || 'pending'

  try {
    let newStatus: AttendanceStatus = currentStatus
    let spouseAttending: boolean | undefined = undefined

    const isCouple = guest.guest_type === 'couple'
    const name = formatGuestName(guest)

    if (isCouple) {
      try {
        const action = await ElMessageBox.confirm(
          `Change status for ${name}\nCurrent status: ${currentStatus}`,
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

        newStatus = 'attending'
        
        try {
          await ElMessageBox.confirm(
            'Will both be attending?',
            'Spouse Attendance',
            {
              confirmButtonText: 'Yes, Attending with Spouse',
              cancelButtonText: 'No, Attending Alone',
              type: 'info',
              showClose: true
            }
          )

          spouseAttending = true
        } catch (action: any) {
          if (action === 'cancel') {
            spouseAttending = false
          } else if (action === 'close') {
            return
          } else {
            throw action
          }
        }
      } catch (action: any) {
        if (action === 'cancel') {
          newStatus = 'not_attending'
          spouseAttending = false
        } else if (action === 'close') {
          return
        } else {
          throw action
        }
      }
    } else {
      try {
        await ElMessageBox.confirm(
          `Change status for ${name}\nCurrent status: ${currentStatus}`,
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
      } catch (action: any) {
        if (action === 'cancel') {
          newStatus = 'not_attending'
        } else if (action === 'close') {
          return
        } else {
          throw action
        }
      }
    }

    console.log('🎯 Selected new status:', newStatus)

    const shouldUpdate = 
      newStatus !== currentStatus || 
      (guest.guest_type === 'couple' && spouseAttending !== undefined && spouseAttending !== guest.spouse_rsvp_status)

    if (shouldUpdate) {
      const updates: Partial<RSVP> = {
        attendance_status: newStatus
      }

      if (guest.guest_type === 'couple' && spouseAttending !== undefined) {
        updates.spouse_attending = spouseAttending
      }

      await guestStore.updateRSVP(guest.guest_id, updates)

      if (guest.guest_id && guest.rsvp_status) {
        await guestStore.updateRSVP(guest.guest_id, updates)
      } else {
        await guestStore.createOrUpdateRSVP(guest.guest_id, newStatus, spouseAttending)
      }
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

const handleGenerateInviteLink = async (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return

  try {
    await guestStore.generateInvitationLink(guest)
    await guestStore.fetchGuests(currentPage.value, pageSize.value)
    ElMessage.success('Invitation link generated successfully!')
  } catch (error) {
    console.error('Failed to generate invitation link:', error)
    ElMessage.error('Failed to generate invitation link')
  }
}

const markAsSent = async (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return

  const currentInviteStatus = guest.invite_sent
  const newInviteStatus = !currentInviteStatus

  console.log('🔄 Updating invite status:', newInviteStatus, guestID)

  try {
    await guestStore.markInviteAsSent(newInviteStatus, guestID)

    if(newInviteStatus) {
      ElMessage.success('Marked as invite sent!')
    } else {
      ElMessage.success('Marked as invite not sent!')
    }

    await guestStore.fetchGuests(currentPage.value, pageSize.value)
  } catch (error) {
    console.error('Failed to mark as sent:', error)
    ElMessage.error('Failed to mark as sent')
  }
}

const handleCopyInviteLink = async (guestID: string) => {
  const guest = guestStore.guests.find(g => g.guest_id === guestID)

  if(!guest) return

  const inviteLink = guest.invitation_link

  if (!inviteLink) {
    ElMessage.error('No invitation link available for this guest')
    return
  }
  
  try {
    await navigator.clipboard.writeText(inviteLink)
    ElMessage.success('Invite link copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
    ElMessage.error('Failed to copy invite link')
  }
}








const currentPage = computed(() => guestStore.currentPage)

const pageSize = computed(() => guestStore.pageSize)

const filteredGuests = computed(() => {
  let filtered = [...guestStore.guests]

  if (filterAttendance.value !== 'all') {
    filtered = filtered.filter(guest => guest.rsvp_status === filterAttendance.value)
  }

  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(guest => guest.guest_category === filterCategory.value)
  }

  return filtered
})

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

const getInviteType = (invitationType: 'rsvp_guest' | 'information_only'): 'primary' | 'info' => {
  const types: Record<'rsvp_guest' | 'information_only', 'primary' | 'info'> = {
    rsvp_guest: 'primary',
    information_only: 'info'
  }
  return types[invitationType]
}

// Event handlers
const handleGuestSubmit = async (formData: Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'>) => {
  try {
    if (selectedGuest.value?.guest_id) {
      guestFormLoading.value = true
      await guestStore.updateGuest(selectedGuest.value.guest_id, formData)
    } else {
      guestFormLoading.value = true
      await guestStore.createGuest(formData)
    }
    showGuestForm.value = false
    selectedGuest.value = null
  } catch (error) {
    console.error('Failed to save guest:', error)
    guestFormLoading.value = false
  }
}

const handleSizeChange = (size: number) => {
  guestStore.pageSize = size
  guestStore.fetchGuests(guestStore.currentPage, size)
}

const handleCurrentChange = (page: number) => {
  guestStore.currentPage = page
  guestStore.fetchGuests(page, guestStore.pageSize)
}

// Scroll the table wrapper to top after pagination or data changes
const scrollTableToTop = async () => {
  await nextTick()

  if(!guestTable.value) return

  guestTable.value.setScrollTop(0);
}

// Call scroll helper after pagination changes
const handleSizeChangeWithScroll = async (size: number) => {
  handleSizeChange(size)
  await scrollTableToTop()
}

const handleCurrentChangeWithScroll = async (page: number) => {
  handleCurrentChange(page)
  await scrollTableToTop()
}

const resetFilters = async () => {
  guestStore.filterAttendance = 'all'
  guestStore.filterCategory = 'all'
  selectedFilters.value = {
    guest_category: [],
    attendance_status: [],
    family_side: [],
    invitation_type: [],
    plus_one_eligibility: [],
    invite_sent: 'all'
  }
  await guestStore.fetchGuests(currentPage.value, pageSize.value)
}

/* const handleSync = async () => {
  try {
    await invitationLinks.syncInvitationLinks()
    if (invitationLinks.syncResult.value) {
      ElMessage.success('Invitation links synced successfully!')
      console.log('Sync Result:', invitationLinks.syncResult.value)
    }
  } catch (error) {
    console.error('Failed to sync invitation links:', error)
    ElMessage.error('Failed to sync invitation links')
  }
} */

// Handle status update


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
      const guest: Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'> = {
        name: guestData.name,
        guest_type: guestData.guest_type,
        guest_category: guestData.guest_category,
        plus_one_eligibility: guestData.plus_one_eligibility ?? 'not_eligible',
        plus_one_limit: guestData.plus_one_limit ?? 0,
        invitation_type: 'rsvp_guest',
        invitation_method: 'digital',
        family_side: guestData.family_side ?? 'both'
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

// Fetch guests on mount
onMounted(() => {
  guestStore.fetchGuests(currentPage.value, pageSize.value)
})

// Open the plus-one modal for a guest
const handleManagePlusOnes = async (guestId: string, guestObj?: GuestTableRow) => {
  try {
    // set selected guest by finding in store if not passed
    if (guestObj) selectedGuest.value = guestStore.guests.find(g => g.guest_id === guestId) || null
    else selectedGuest.value = guestStore.guests.find(g => g.guest_id === guestId) || null

    managePlusOne.value = true
  } catch (e) {
    console.error('Failed to open plus-one modal:', e)
  }
}

// Save handler for plus-one modal - persists via guest store
const handlePlusOneDataSave = async ({ guestId, plus_ones }: { guestId: string | number | null, plus_ones: any[] }) => {
  if (!guestId) {
    ElMessage.error('No guest selected')
    return
  }

  try {
    plusOneSaving.value = true
    // createOrUpdatePlusOne expects an array of plus_one objects
    await guestStore.createOrUpdatePlusOne(plus_ones as any)
    ElMessage.success('Plus ones updated successfully')
    managePlusOne.value = false
    // refresh guest list
    await guestStore.fetchGuests(currentPage.value, pageSize.value)
  } catch (e) {
    console.error('Failed to save plus ones:', e)
    ElMessage.error('Failed to save plus ones')
  } finally {
    plusOneSaving.value = false
  }
}
</script>

<style scoped>
.guests-view {
  padding: 40px 40px 20px 40px;
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
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
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  padding-right: 0;
  gap: 8px;
}

.header .action-buttons .el-button {
  margin-inline: 0;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-shrink: 0;
}

.bulk-action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.bulk-action-buttons .el-button {
  margin: 0;
}

.advanced-filters {
  display: flex;
  gap: 12px;
}

.el-table {
  flex: 1;
}

.el-table .action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  padding-right: 12px;
}

.el-table .action-buttons .el-button {
  padding: 6px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  flex-shrink: 0;
}
</style>
