<template>
  <el-page-header icon="" class="page-header">
    <template #title>
      <div class="header-content">
        <span class="header-title">Goodwill Messages</span>
      </div>
      
      <p class="header-description">
        See all the lovely messages guests have sent
      </p>
    </template>
  </el-page-header>

  <el-container direction="vertical">
    <template #default>
      <div class="section-header">
        <el-segmented v-model="selectedView" :options="['All', 'Approved', 'Pending']" />
        <div>
          
        </div>
        <span>{{ goodwillStore.totalMessages }} messages</span>
      </div>
      <el-skeleton :loading="goodwillStore.loading" :count="6" animated class="card-skeleton-wrapper">
        <template #template>
          <div class="card-skeleton">
            <div>
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
            </div>
            <div>
              <el-skeleton-item variant="circle" />
              <el-skeleton-item variant="p" />
            </div>
          </div>
        </template>

        <template #default>
          <div class="cards-container">
            <div v-for="(message, index) in activeView" :key="message.message_id" class="message-card">
              <div>
                <div class="card-header">                    
                  <el-button 
                    v-if="message.is_approved"
                    :loading="isLoading && index === selectedItemIndex" 
                    @click="markAsApproved(index, message.message_id, 'unapprove')"
                  >
                    Disapprove
                  </el-button>
                  <el-button 
                    v-else 
                    :loading="isLoading && index === selectedItemIndex" 
                    @click="markAsApproved(index, message.message_id, 'approve')"
                    type="success"
                  >
                      Approve
                  </el-button>

                  <el-icon v-if="message.is_approved" color="#fff" class="approve-icon"><Check /></el-icon>
                </div>
                <p>{{ message.message }}</p>
              </div>
              <div class="card-footer">
                <el-avatar>{{ getInitials(message.guest_name) }}</el-avatar>
                <span>{{ goodwillStore.formatGuestName(message.guest_name) }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </template>
  </el-container>
</template>

<script setup lang="ts">
import { ElPageHeader, ElMain, ElSkeleton, ElSkeletonItem, ElContainer, ElAvatar, ElSegmented, ElButton, ElMessage} from 'element-plus';
import { Check } from '@element-plus/icons-vue'
import { useGoodwillStore, type GoodwillMessage } from '@/stores/goodwill';
import { ref, onMounted, watch } from 'vue';

const goodwillStore = useGoodwillStore()

const selectedView = ref('All')
const activeView = ref<GoodwillMessage[] | null>(null)
const isLoading = ref<boolean>(false)
const selectedItemIndex = ref<number | null>(null)

const getInitials = (name: any): string => {
  const initial_one = name.first_name ? name.first_name.charAt(0) : ''
  const initial_two = name.last_name ? name.last_name.charAt(0) : ''

  return `${initial_one}${initial_two}`
}

const setActiveView = (value: string) => {
  if (value === 'Approved') activeView.value = goodwillStore.approvedMessages
  else if (value === 'Pending') activeView.value = goodwillStore.pendingMessages
  else activeView.value = goodwillStore.messages
}

const markAsApproved = async (i: number, id: string, action: string) => {
  isLoading.value = true
  selectedItemIndex.value = i

  try {
    let res: boolean

    if(action === 'approve') res = await goodwillStore.approveMessage(id)
    else res = await goodwillStore.unapproveMessage(id)

    if(res) ElMessage.success('Message Approved')
  }catch (err) {
    ElMessage.error('Could not approve message')
  }finally {
    isLoading.value = false
  }
}

watch(() => selectedView.value, (newSelection, oldSelection) => {
  if(newSelection && newSelection !== oldSelection) {
    setActiveView(newSelection)
  }
}, {immediate: true})

onMounted(async () => {
  await goodwillStore.fetchMessages(true)

  if(goodwillStore.messages) activeView.value = goodwillStore.messages
})
</script>

<style>
.el-main {
  flex-direction: column;
  padding: 40px 40px 20px 40px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header .header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.page-header .header-content .header-title {
  font-size: 24px;
  font-weight: 600;
}

.page-header .header-content .header-description {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.el-space {
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.el-segmented {
  flex-grow: 0;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.message-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 300px;
  max-width: 360px;
  background-color: white;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 24px;
}

.message-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  min-height: 32px;
}

.message-card .card-header .approve-icon {
  width: 28px;
  height: 28px;
  padding: 4px;
  border-radius: 100vw;
  background-color: #67C23A;
}

.message-card .card-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
