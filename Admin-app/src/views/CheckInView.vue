<template>
  <el-main>
    <div class="header">
      <div class="title">
        <h2>Check-in Staff</h2>
        <el-button type="text" @click="authStore.logout">
          Logout
        </el-button>
      </div>
      <el-input :model-value="searchInput" :prefix-icon="Search" clearable placeholder="Search guests" @input="handleInput" @keyup="handleInput" />
    </div>

    <table class="table__check-in">
      <thead>
        <tr class="table-row table-row__head">
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="guest in guestList" :key="guest.id">
          <tr class="table-row table-row__body">
            <td>
              {{ guest.name }} 
              <el-tag v-if="guest.is_tagged" type="success">Tagged</el-tag>
              <el-tag v-if="guest.is_spouse_tagged" type="success" plain>Spouse Tagged</el-tag>
            </td>
            <td>
              <el-button 
                v-if="guest.type === 'couple' && guest.spouse_attending && !guest.is_spouse_tagged"
                type="primary"
                :loading="isUpdating && guest.spouse_attending && selectedGuest === guest.id"
                @click="markSpouseAsTagged(guest.id)"
                size="small"
                plain
              >
                Tag Spouse
              </el-button>
              <el-button 
                v-if="!guest.is_tagged"
                type="primary"
                :loading="isUpdating && selectedGuest === guest.id"
                @click="markGuestAsTagged(guest.id)"
                size="small"
              >
                Tag Guest
              </el-button>
            </td>
          </tr>
          <tr v-for="plusOne in guest.plus_ones" :key="plusOne.id" class="table-row table-row__body table-row__body--plus-one">
            <td>
              {{ plusOne.name }}
              <el-tag v-if="plusOne.is_tagged" type="success">Tagged</el-tag>
            </td>
            <td>
              <el-button 
                v-if="!plusOne.is_tagged"
                type="primary"
                :loading="isUpdating && selectedGuest === plusOne.id"
                @click="markPlusOneAsTagged(plusOne.id, guest.id)"
                size="small"
                plain
              >
                Tag Plus One
              </el-button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </el-main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCheckinStore } from '@/stores/checkin';
import { ElButton, ElMessage, ElTag, ElHeader } from 'element-plus';
import { Search } from '@element-plus/icons-vue'
import { formatGuestName } from '@/utils/helper';

const authStore = useAuthStore()
const checkinStore = useCheckinStore()

const isUpdating = ref<boolean>(false)
const selectedGuest = ref<string | null>(null)
const searchInput = ref<string | null>(null)
const isSearching = ref<boolean>(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const guestList = computed(() => {
  const guests = checkinStore.guestList
  const searchResult = checkinStore.searchResultList
  let list
  
  if(!isSearching.value) {
    list = guests.map(guest => {
      return {
        id: guest.guest_id,
        name: formatGuestName(guest.name, guest.guest_type === 'couple', guest.spouse_attending),
        type: guest.guest_type,
        is_tagged: guest.is_tagged,
        is_spouse_tagged: guest.is_spouse_tagged,
        spouse_attending: guest.spouse_attending,
        plus_ones: guest.plus_ones.map(plusOne => {
          return {
            id: plusOne.plus_one_id,
            name: formatGuestName(plusOne.name),
            is_tagged: plusOne.is_tagged
          }
        })
      }
    })
  }else {
    list = searchResult.map(result => {
      return {
        id: result.guest_id,
        name: formatGuestName(result.name, result.guest_type === 'couple', result.spouse_attending),
        type: result.guest_type,
        is_tagged: result.is_tagged,
        is_spouse_tagged: result.is_spouse_tagged,
        spouse_attending: result.spouse_attending,
        plus_ones: result.plus_ones.map(plusOne => {
          return {
            id: plusOne.plus_one_id,
            name: formatGuestName(plusOne.name),
            is_tagged: plusOne.is_tagged
          }
        })
      }
    })
  }

  return list
})

const markGuestAsTagged = async (id: string) => {
  selectedGuest.value = id
  isUpdating.value = true

  try {
    let guest 
    
    if(!isSearching.value) guest = checkinStore.guestList.find(guest => guest.guest_id === selectedGuest.value)
    else guest = checkinStore.searchResultList.find(guest => guest.guest_id === selectedGuest.value)

    if(!guest) {
      console.error('Guest with id:', id, 'not found')
      return
    }

    const status = !guest.is_tagged
    await checkinStore.updateCheckinStatus(id, status)

    guest.is_tagged = status
    ElMessage.success('Update successful')
  }catch (err) {
    console.error('Failed to update check-in status for guest id:', selectedGuest.value)
    ElMessage.error('Update Failed. Try again')
  }finally {
    isUpdating.value = false
  }
}

const markSpouseAsTagged = async (id: string) => {
  selectedGuest.value = id
  isUpdating.value = true

  try {
    let guest 
    
    if(!isSearching.value) guest = checkinStore.guestList.find(guest => guest.guest_id === selectedGuest.value)
    else guest = checkinStore.searchResultList.find(guest => guest.guest_id === selectedGuest.value)

    if(!guest) {
      console.error('Guest with id:', id, 'not found')
      return
    }

    if(guest.guest_type !== 'couple' || !guest.spouse_attending) {
      console.error('Guest is either not a couple or not attending with spouse')
      return
    }

    const status = !guest.is_spouse_tagged
    await checkinStore.updateSpouseCheckinStatus(id, status)

    guest.is_spouse_tagged = status
    ElMessage.success('Update successful')
  }catch (err) {
    console.error('Failed to update spouse check-in status for guest id:', selectedGuest.value)
    ElMessage.error('Update Failed. Try again')
  }finally {
    isUpdating.value = false
  }
}

const markPlusOneAsTagged = async (plusOneId: string, guestId: string) => {
  selectedGuest.value = plusOneId
  isUpdating.value = true

  try {
    let guest
    
    if(!isSearching.value) guest = checkinStore.guestList.find(guest => guest.guest_id === guestId)
    else guest = checkinStore.searchResultList.find(guest => guest.guest_id === guestId)

    if(!guest) {
      console.error('Guest with id:', guestId, 'not found')
      return
    }

    const plusOne = guest.plus_ones.find(plusOne => plusOne.plus_one_id === plusOneId)

    if(!plusOne) {
      console.error('Guset plus one with id:', plusOneId, 'not found')
      return
    }

    const status = !plusOne.is_tagged
    await checkinStore.updatePlusOneCheckinStatus(plusOneId, status)

    plusOne.is_tagged = status
    ElMessage.success('Update successful')
  }catch (err) {
    console.error('Failed to update spouse check-in status for guest id:', selectedGuest.value)
    ElMessage.error('Update Failed. Try again')
  }finally {
    isUpdating.value = false
  }
}

const handleInput = async (value: any) => {
  searchInput.value = typeof value === 'string' ? value : value.target.value
  if(searchTimeout.value) clearTimeout(searchTimeout.value)

  const parsedQuery = searchInput.value?.toString().toLowerCase().trim() || null

  if(parsedQuery) {
    searchTimeout.value = setTimeout(async () => {
      isSearching.value = true
      await checkinStore.searchAttendingGuestByName(parsedQuery)
    }, 500)
  }else {
    isSearching.value = false
    if(!checkinStore.guestList) {
      await checkinStore.fetchGuestList()
    }
  }
}

/* watch(() => searchInput.value, async (newVal) => {
  clearTimeout(searchTimeout)
  const parsedQuery = newVal?.toString().toLowerCase().trim()

  if(parsedQuery) {
    searchTimeout = setTimeout(async () => {
      isSearching.value = true
      await checkinStore.searchAttendingGuestByName(parsedQuery)
    }, 500)
  }else {
    isSearching.value = false
    if(!checkinStore.guestList) {
      await checkinStore.fetchGuestList()
    }
  }
}) */

onMounted(() => {
  checkinStore.fetchGuestList()
})
</script>

<style scoped>
.el-main {
  min-width: 300px;
  width: 100vw;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px 8px;
  font-size: 14px;
  line-height: 1.25;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-inline: 8px;
  padding-bottom: 12px;
}
.header .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table__check-in {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: stretch;
  flex-grow: 1;
  min-height: 100px;
  overflow: hidden;
}

.table__check-in thead {
  padding-inline: 8px ;
}

.table__check-in tbody {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-grow: 1;
  overflow-y: auto;
  padding-inline: 8px;
}

.table-row {
  display: flex;
  align-self: stretch;
  align-items: center;
  gap: 8px;
}
.table-row td:first-child,
.table-row th:first-child {
  flex-grow: 1;
  text-align: left;
  padding: 8px;
}
.table-row td:last-child,
.table-row th:last-child {
  min-width: 100px;
  padding: 8px;
}
.el-button {
  margin-left: 0;
}

.table-row.table-row__head {
  padding: 8px;
}

.table-row.table-row__body {
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  background-color: #f5f5f5;
}
.table-row.table-row__body td:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}
.table-row.table-row__body td:last-child {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.table-row.table-row__body--plus-one {
  margin-left: 20px;
  position: relative;
}
.table-row.table-row__body--plus-one::before {
  content: "\21B3";
  display: block;
  position: absolute;
  top: 50%;
  left: -12px;
  transform: translateY(-50%);
}
</style>