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

    <!-- Main Content -->
    <div v-if="!isBulkEditing" class="filters">
      <div class="search-filter">
        <el-input v-model="searchInput" :prefix-icon="Search" clearable placeholder="Search guests" @input="handleSearch" />
        <el-button @click="showFilterDrawer = true" :type="appliedFiltersCount ? 'primary' : 'default'" plain>Advanced Filters {{ appliedFiltersCount ? `(${appliedFiltersCount})` : '' }}</el-button>
        <el-button v-if="appliedFiltersCount" @click="resetFilters" plain>Clear All</el-button>
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
    </div>

    <div v-else class="bulk-action-buttons">
      <el-select v-model="bulkActionValues.inviteValue" :empty-values="[null, undefined]" placeholder="Mark Invite as:" style="width: 200px" @change="handleBulkChange('invite')">
        <el-option label="Sent" value="sent" />
        <el-option label="Not Sent" value="not_sent" />
      </el-select>

      <el-select v-model="bulkActionValues.statusValue" :empty-values="[null, undefined]" placeholder="Set Status to:" style="width: 200px" @change="handleBulkChange('status')">
        <el-option value="attending" label="Attending" />
        <el-option value="not_attending" label="Not Attending" />
        <el-option value="spouse_attending" label="Attending with Spouse" />
        <el-option value="pending" label="Pending" />
      </el-select>

      <el-select v-model="bulkActionValues.categoryValue" :empty-values="[null, undefined]" placeholder="Set Category to:" style="width: 200px" @change="handleBulkChange('category')">
        <el-option value="family" label="Family" />
        <el-option value="friend" label="Friend" />
        <el-option value="asoebi" label="Asoebi" />
      </el-select>

      <el-select v-model="bulkActionValues.sideValue" :empty-values="[null, undefined]" placeholder="Set Side to:" style="width: 200px" @change="handleBulkChange('side')">
        <el-option value="bride" label="Bride" />
        <el-option value="groom" label="Groom" />
        <el-option value="both" label="both" />
      </el-select>

      <!-- <el-button :icon="Link">Generate Invitation {{ selectedTableItems?.length === 1 ? 'Link' : 'Links' }}</el-button> -->
      <el-button :icon="Delete" type="danger" plain :loading="deletingGuest" @click="handleBulkDelete">Delete {{ selectedTableItems?.length === 1 ? 'Guest' : 'Guests' }}</el-button>
    </div>

    <!-- Empty State -->
    <el-empty v-if="!guestStore.hasGuests && !guestStore.loading" description="Start building your guest list" />

    <el-table v-else ref="guestTable" :data="guestTableData" v-loading="guestStore.loading" row-key="id" @selection-change="handleSelection">
      <el-table-column type="selection" width="48" />
      <el-table-column fixed label="Name" prop="name" width="300" />
      <el-table-column label="Status" min-width="180">
        <template #default="{ row }">
          <el-tag v-if="row.status" :type="getStatusType(row.id)">
            {{ row.status }}
          </el-tag>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="Category" prop="category" min-width="150" />
      <el-table-column label="Side" prop="family" min-width="150" />
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
              v-if="row.class !== 'Information Only'"
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

  <el-drawer
    title="Advanced Filters"
    v-model="showFilterDrawer"
    direction="rtl"
    size="420px"
  >
    <template #default>
      <div class="filter-section">
        <p class="section-header">Geust Category</p>
        <el-checkbox-group v-model="selectedFilters.guest_category">
          <el-checkbox label="Family" value="family" />
          <el-checkbox label="Friend" value="friend" />
          <el-checkbox label="Asoebi" value="asoebi" />
          <el-checkbox label="Bestman" value="bestman" />
          <el-checkbox label="Chief Bridesmaid" value="chiefbridesmaid" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Family Side</p>
        <el-checkbox-group v-model="selectedFilters.family_side">
          <el-checkbox label="Bride" value="bride" />
          <el-checkbox label="Groom" value="groom" />
          <el-checkbox label="Both" value="both" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Invitation Type</p>
        <el-checkbox-group v-model="selectedFilters.invitation_type">
          <el-checkbox label="RSVP Guest" value="rsvp_guest" />
          <el-checkbox label="Information Only" value="information_only" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Attendance Status</p>
        <el-checkbox-group v-model="selectedFilters.rsvp_status">
          <el-checkbox label="Attending" value="attending" />
          <el-checkbox label="Not Attending" value="not_attending" />
          <el-checkbox label="Pending" value="pending" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Spouse Attendance Status</p>
        <el-checkbox-group v-model="selectedFilters.spouse_rsvp_status">
          <el-checkbox label="Attending with spouse" value="true" />
          <el-checkbox label="Attending without spouse" value="false" />
          <el-checkbox label="Pending" value="null" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Invite Sent</p>
        <el-checkbox-group v-model="selectedFilters.invite_sent">
          <el-checkbox label="Sent" value="true" />
          <el-checkbox label="Not Sent" value="false" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Guest Type</p>
        <el-checkbox-group v-model="selectedFilters.guest_type">
          <el-checkbox label="Single" value="single" />
          <el-checkbox label="Couple" value="couple" />
        </el-checkbox-group>
      </div>

      <div class="filter-section">
        <p class="section-header">Plus One Eligibility</p>
        <el-checkbox-group v-model="selectedFilters.plus_one_eligibility">
          <el-checkbox label="Eligible" value="eligible" />
          <el-checkbox label="Not Eligible" value="not_eligibility" />
        </el-checkbox-group>
      </div>
    </template>

    <template #footer>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px">
        <el-button @click="resetFilters">Clear</el-button>
        <el-button type="primary" @click="handleApplyFromDrawer">Apply</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useGuestStore } from '@/stores/guest'
import { useAuthStore } from '@/stores/auth'
// import { useInvitationLinks } from '@/composables/useInvitationLinks'
import GuestForm from '@/components/GuestForm.vue'
import PlusOneForm from '@/components/PlusOneForm.vue'
import GuestImportDialog from '@/components/GuestImportDialog.vue'
import { Link, Edit, Delete, Check, User, Message, Position, Plus, Refresh, Search } from '@element-plus/icons-vue'
import type { Guest, AttendanceStatus, RSVP, GuestTableRow, GuestName } from '@/types/guest'

const authStore = useAuthStore()
const guestStore = useGuestStore()
// const invitationLinks = useInvitationLinks()

type TableItem = {
  id: string
  name: GuestName
  category: string
  family: string
  status: string
  class: string
  plus_ones: string
  invitation_link: string
  invite_sent: boolean
  can_add_plus_one: boolean
  phone_number: string
  actions: any

}

type SearchItem = {
  name: string
  class: string
  status: string
}

const showGuestForm = ref(false)
const showImportDialog = ref(false)
const selectedGuest = ref<GuestTableRow | null>(null)
const importLoading = ref(false)
const guestTable = ref<any>(null)
const isBulkEditing = ref<boolean>(false)
const selectedTableItems = ref<TableItem[] | null>(null)
const managePlusOne = ref<boolean>(false)
const guestFormLoading = ref<boolean>(false)
const plusOneSaving = ref<boolean>(false)
const showFilterDrawer = ref<boolean>(false)
const deletingGuest = ref<boolean>(false)
const searchInput = ref<string | null>(null)
const isSearching = ref<boolean>(false)

const searchValue = ref<string[]>([])
const searching = ref<boolean>(false)
const results = ref([])

const bulkActionValues = ref<{
  inviteValue: string | null
  statusValue: string | null
  categoryValue: string | null
  sideValue: string | null
}>({
  inviteValue: null,
  statusValue: null,
  categoryValue: null,
  sideValue: null
})

const selectedFilters = ref<{
  guest_category?: string[]
  rsvp_status?: string[]
  family_side?: string[]
  invitation_type?: string[]
  plus_one_eligibility?: string[]
  invite_sent?: string[]
  guest_type?: string[]
  spouse_rsvp_status?: string[]
}>({
  guest_category: [],
  rsvp_status: [],
  family_side: [],
  invitation_type: [],
  plus_one_eligibility: [],
  invite_sent: [],
  guest_type: [],
  spouse_rsvp_status: []
})

let searchTimeout: ReturnType<typeof setTimeout>

/* ----------------------------------- Computed Properties ---------------------------------- */
const guestTableData = computed(() => {
  const guests = guestStore.guests
  const searchResult = guestStore.guestsSearchResult
  let remappedGuests

  if(!isSearching.value) {
    console.log('🚫 Not Searching')
    remappedGuests = guests.map(guest => {
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
        phone_number: guest.phone_number,
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
  }else {
    console.log('🔎 Searching')
    remappedGuests = searchResult.map(guest => {
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
        phone_number: guest.phone_number,
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
  }
  
  return remappedGuests
})

const currentPage = computed(() => guestStore.currentPage)

const pageSize = computed(() => guestStore.pageSize)

const appliedFiltersCount = computed(() => {
  const filters = selectedFilters.value || {}
  return Object.values(filters).reduce((count, val) => {
    if (!val) return count
    if (Array.isArray(val)) return count + val.filter(Boolean).length
    return count
  }, 0)
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
  const middleName = guest?.name?.middle_name
  const lastName = guest?.name?.last_name
  return guestType === 'couple' ? `${title ? title : 'Mr.'} & Mrs. ${firstName} ${lastName ? lastName : ''} ${suffix ? suffix : ''}` : `${title} ${firstName} ${middleName ? middleName : ''} ${lastName ? lastName : ''} ${suffix ? suffix : ''}`
}

const formatGuestStatus = (guest: GuestTableRow) => {
  const status = guest?.rsvp_status ?? '--' as AttendanceStatus

  if (status === 'attending' && guest?.guest_type === 'couple') {
    return guest.spouse_rsvp_status ? 'Attending With Spouse' : 'Attending Without Spouse'
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
    bride: 'Bride',
    groom: 'Groom',
    both: 'Both',
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

// const formatPhoneNumber

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

      if (guest.guest_id && guest.rsvp_status) {
        await guestStore.updateRSVP(guest.guest_id, updates)
      } else {
        await guestStore.createOrUpdateRSVP(guest.guest_id, newStatus, spouseAttending)
      }
      console.log('✅ RSVP status update completed')

      if(appliedFiltersCount.value > 0) await applyFilters()
      else await guestStore.fetchGuests(guestStore.currentPage, guestStore.pageSize)
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

    const guest = guestStore.guests.find(g => g.guest_id === guestID)

    if(guest) guest.invite_sent = newInviteStatus

    if(newInviteStatus) {
      ElMessage.success('Marked as invite sent!')
    } else {
      ElMessage.success('Marked as invite not sent!')
    }

    // await guestStore.fetchGuests(currentPage.value, pageSize.value)
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

const handleGuestSubmit = async (formData: Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'>) => {
  try {
    if (selectedGuest.value?.guest_id) {
      guestFormLoading.value = true
      await guestStore.updateGuest(selectedGuest.value.guest_id, formData)

      if(appliedFiltersCount.value > 0) await applyFilters()
      else await guestStore.fetchGuests(guestStore.currentPage, guestStore.pageSize)
      ElMessage.success('Guest updated successfully')
    } else {
      guestFormLoading.value = true
      await guestStore.createGuest(formData)

      console.log('🔄 Refreshing guest list')
      if(appliedFiltersCount.value > 0) await applyFilters()
      else await guestStore.fetchGuests(guestStore.currentPage, guestStore.pageSize)
      console.log('✨ Guest creation completed successfully')
      ElMessage.success('Guest added successfully')
    }
    showGuestForm.value = false
    selectedGuest.value = null
  } catch (error) {
    console.error('Failed to save guest:', error)
    guestFormLoading.value = false
  }
}

const handleBulkChange = async (type: 'invite' | 'status' | 'category' | 'side') => {
  if (!selectedTableItems.value || selectedTableItems.value.length === 0) {
    console.warn('No guests selected for bulk update')
    return
  }

  const selectedIDs = selectedTableItems.value.map(item => item.id)

  const mapInviteValue = (v: string | null): boolean | null =>
    v === 'sent' ? true : v === 'not_sent' ? false : null

  let table: string
  let update: any

  if(type === 'side' || type === 'category') table = 'guests'
  else if(type === 'invite' || type === 'status') table = 'rsvps'
  else throw new Error('Invalid type selected')

  if (type === 'side') update = {family_side: bulkActionValues.value.sideValue}
  else if (type === 'category') update = {guest_category: bulkActionValues.value.categoryValue}
  else if (type === 'status') update = {attendance_status: bulkActionValues.value.statusValue}
  else if (type === 'invite') update = {invite_sent: mapInviteValue(bulkActionValues.value.inviteValue)}

  try{
    await guestStore.bulkUpdate(table, selectedIDs, update)
  }catch (err) {
    throw err
  }finally{
    bulkActionValues.value.categoryValue = null
    bulkActionValues.value.inviteValue = null
    bulkActionValues.value.sideValue = null
    bulkActionValues.value.statusValue = null
  }
}

const handleBulkDelete = async () => {
  if (!selectedTableItems.value || selectedTableItems.value.length === 0) {
    console.warn('No guests selected for bulk update')
    return
  }

  const selectedIDs = selectedTableItems.value.map(item => item.id)

  try{
    deletingGuest.value = true

    await guestStore.bulkDelete(selectedIDs)

    ElMessage.success(`${selectedIDs.length} guest(s) removed successfully`)
  }catch (err) {
    throw err
  }finally {
    deletingGuest.value = false
  }
}

const handleSizeChange = async (size: number) => {
  guestStore.pageSize = size

  if(appliedFiltersCount.value > 0) await applyFilters()
  else guestStore.fetchGuests(guestStore.currentPage, size)
}

const handleCurrentChange = async (page: number) => {
  guestStore.currentPage = page

  if(appliedFiltersCount.value > 0) await applyFilters()
  else guestStore.fetchGuests(page, guestStore.pageSize)
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

const applyFilters = async () => {
  // Build payload mapping to view columns
  const payload: any = {}
  if (selectedFilters.value.guest_category && selectedFilters.value.guest_category.length > 0) payload.guest_category = selectedFilters.value.guest_category
  if (selectedFilters.value.rsvp_status && selectedFilters.value.rsvp_status.length > 0) payload.rsvp_status = selectedFilters.value.rsvp_status
  if (selectedFilters.value.family_side && selectedFilters.value.family_side.length > 0) payload.family_side = selectedFilters.value.family_side
  if (selectedFilters.value.invitation_type && selectedFilters.value.invitation_type.length > 0) payload.invitation_type = selectedFilters.value.invitation_type
  if (selectedFilters.value.plus_one_eligibility && selectedFilters.value.plus_one_eligibility.length > 0) payload.plus_one_eligibility = selectedFilters.value.plus_one_eligibility
  if (selectedFilters.value.invite_sent && selectedFilters.value.invite_sent.length > 0) payload.invite_sent = selectedFilters.value.invite_sent
  if (selectedFilters.value.guest_type && selectedFilters.value.guest_type.length > 0) payload.guest_type = selectedFilters.value.guest_type
  if (selectedFilters.value.spouse_rsvp_status && selectedFilters.value.spouse_rsvp_status.length > 0) payload.spouse_rsvp_status = selectedFilters.value.spouse_rsvp_status

  await guestStore.fetchGuests(currentPage.value, pageSize.value, payload)
}

const handleApplyFromDrawer = async () => {
  guestStore.currentPage = 1
  showFilterDrawer.value = false
  await applyFilters()
}

const resetFilters = async () => {
  selectedFilters.value = {
    guest_category: [],
    rsvp_status: [],
    family_side: [],
    invitation_type: [],
    plus_one_eligibility: [],
    invite_sent: [],
    guest_type: [],
    spouse_rsvp_status: []
  }
  await guestStore.fetchGuests(currentPage.value, pageSize.value)
}

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

const handleAddNewGuest = () => {
  console.log('➕ Opening form for new guest')
  selectedGuest.value = null // Clear any previously selected guest
  showGuestForm.value = true
}

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
        family_side: guestData.family_side ?? 'both',
        phone_number: guestData.phone_number ?? null
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

const handleSearch = async (value: string) => {
  const query = value
  clearTimeout(searchTimeout)

  if(query) {
    const parsedQuery = query.toString().toLowerCase().trim()

    searchTimeout = setTimeout(async () => {
      isSearching.value = true
      await guestStore.searchGuests(parsedQuery)
    }, 500)
  }else {
    if(appliedFiltersCount.value > 0) {
      isSearching.value = false
      await applyFilters()
    }else {
      isSearching.value = false
      await guestStore.fetchGuests(guestStore.currentPage, guestStore.pageSize)
    }
  }
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


/* ---------------------------------- Watchers ----------------------------------*/
/* watch(() => searchInput, async (newVal, oldVal) => {
  if(newVal && newVal !== oldVal) {
    const query = newVal.toString().toLowerCase().trim()

    setTimeout(async () => {
      await guestStore.searchGuests(query)
    }, 500)
  }else {
    if(appliedFiltersCount.value > 0) await applyFilters()
    else await guestStore.fetchGuests(guestStore.currentPage, guestStore.pageSize)
  }
}) */


/* ---------------------------------- Lifecycle Hooks -------------------------------- */
onMounted(() => {
  guestStore.fetchGuests(currentPage.value, pageSize.value)
})
</script>

<style scoped>
.guests-view {
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

.search-filter {
  display: flex;
  gap: 16px;
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

.filter-section .section-header {
  color: #5f5f5f;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  flex-shrink: 0;
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
}

.el-checkbox-group .el-checkbox {
  margin: 0;
}
</style>
