<template>
  <div class="guests-view">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>Guest List</h1>
        <p class="description">
          Manage your wedding guests and their invitations
          <span v-if="authStore.user" class="user-context">
            - {{ authStore.user.email }}
          </span>
        </p>
      </div>
      <el-button 
        v-if="authStore.featureAccess.canCreateGuests"
        type="primary" 
        @click="showGuestForm = true"
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
        style="width: 100%"
      >
        <!-- Guest Details -->
        <el-table-column label="Guest Details" min-width="250">
          <template #default="{ row }">
            <div class="guest-details">
              <span class="guest-name">
                {{ formatGuestName(row) }}
              </span>
              <el-tag size="small" :type="getCategoryType(row.guest_category)">
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
            <template v-if="row.plus_one_eligibility">
              <span v-if="row.rsvp?.plus_one_name">
                {{ row.rsvp.plus_one_name }}
              </span>
              <el-button 
                v-else-if="row.rsvp?.attendance_status === 'attending'"
                link
                type="primary"
                @click="handleAddPlusOne(row)"
              >
                Add Plus One
              </el-button>
              <span v-else>-</span>
            </template>
            <span v-else>Not Eligible</span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip
                v-if="!authStore.hasFeatureAccess('edit_rsvp_responses')"
                content="You don't have permission to send invites"
                placement="top"
              >
                <el-button 
                  link
                  type="primary"
                  disabled
                >
                  Send Invite
                </el-button>
              </el-tooltip>
              <el-button 
                v-else
                link
                type="primary"
                @click="handleSendInvite(row)"
              >
                Send Invite
              </el-button>

              <el-tooltip
                v-if="!authStore.featureAccess.canEditGuests"
                content="You don't have permission to edit guests"
                placement="top"
              >
                <el-button
                  link
                  type="primary"
                  disabled
                >
                  Edit
                </el-button>
              </el-tooltip>
              <el-button
                v-else
                link
                type="primary"
                @click="handleEditGuest(row)"
              >
                Edit
              </el-button>

              <el-tooltip
                v-if="!authStore.featureAccess.canDeleteGuests"
                content="You don't have permission to delete guests"
                placement="top"
              >
                <el-button
                  link
                  type="danger"
                  disabled
                >
                  Remove
                </el-button>
              </el-tooltip>
              <el-button
                v-else
                link
                type="danger"
                @click="handleDeleteGuest(row)"
              >
                Remove
              </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useGuestStore } from '@/stores/guest'
import { useAuthStore } from '@/stores/auth'
import GuestForm from '@/components/GuestForm.vue'
import type { Guest, GuestWithRSVP, GuestCategory } from '@/types/guest'

const authStore = useAuthStore()

const guestStore = useGuestStore()
const showGuestForm = ref(false)
const selectedGuest = ref<Partial<Guest> | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)

// Fetch guests on mount
onMounted(() => {
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
    selectedGuest.value = undefined
  } catch (error) {
    console.error('Failed to save guest:', error)
  }
}

const handleEditGuest = (guest: Guest) => {
  selectedGuest.value = guest
  showGuestForm.value = true
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

const handleSendInvite = async (guest: Guest) => {
  // TODO: Implement invitation sending logic
  ElMessageBox.alert('Invitation sending feature coming soon!', 'Info')
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
</script>

<style scoped>
.guests-view {
  padding: 20px;
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

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.advanced-filters {
  display: flex;
  gap: 12px;
}

.guest-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guest-name {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
