<template>
  <el-page-header icon="" class="dashboard-header">
    <template #title>
      <div class="header-content">
        <span class="header-title">Dashboard</span>
        <el-button 
          :icon="Refresh" 
          :loading="dashboardStore.loading"
          @click="handleRefresh"
          circle
          size="small"
        />
      </div>
      
      <p class="description">
        An overview of your event's activities
      </p>
    </template>

    <template #extra>
      <!-- Last Updated -->
      <div v-if="dashboardStore.stats">
        <el-text type="info" size="small">
          Last updated: {{ new Date(dashboardStore.stats.last_updated).toLocaleString() }}
        </el-text>
      </div>
    </template>
  </el-page-header>

    <!-- Loading State -->
  <el-skeleton 
    v-if="dashboardStore.loading" 
    :rows="8" 
    animated 
  />

  <!-- Error State -->
  <el-alert
    v-if="dashboardStore.error"
    :title="dashboardStore.error"
    type="error"
    show-icon
    closable
    @close="dashboardStore.clearError"
    class="error-alert"
  />

  <!-- Dashboard Content -->
  <div v-if="dashboardStore.stats && !dashboardStore.loading">
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistics-card">
          <div>
            <div class="card-header">
              Total Attending
              <el-tooltip
                content="Total number of guest attending the event"
                placement="right"
                :show-after="500"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
            <el-statistic :value="dashboardStore.stats.total_attending_headcount" />
          </div>

          <div>
            <div class="mb-4">
              <span class="stats-progress-label">Primary Guests ({{ Math.floor((dashboardStore.stats.primary_guests_attending / dashboardStore.stats.total_attending_headcount) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((dashboardStore.stats.primary_guests_attending / dashboardStore.stats.total_attending_headcount) * 100)"
                text-inside
                :stroke-width="20"
              >
                <span>{{ dashboardStore.stats.primary_guests_attending }}</span>
              </el-progress>
            </div>
            <div class="mb-4">
              <span class="stats-progress-label">Spouses ({{ Math.floor((dashboardStore.stats.spouses_attending / dashboardStore.stats.total_attending_headcount) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((dashboardStore.stats.spouses_attending / dashboardStore.stats.total_attending_headcount) * 100)"
                text-inside
                :stroke-width="20"
              >
                <span>{{ dashboardStore.stats.spouses_attending }}</span>
              </el-progress>
            </div>
            <div>
              <span class="stats-progress-label">Plus Ones ({{ Math.floor((dashboardStore.stats.plus_ones_attending / dashboardStore.stats.total_attending_headcount) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((dashboardStore.stats.plus_ones_attending / dashboardStore.stats.total_attending_headcount) * 100)"
                text-inside
                :stroke-width="20"
              >
                <span>{{ dashboardStore.stats.plus_ones_attending }}</span>
              </el-progress>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="statistics-card">
          <div>
            <div class="card-header">
              Total Invited
              <el-tooltip
                content="Total number of guest invited"
                placement="right"
                :show-after="500"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
            <el-statistic :value="dashboardStore.stats.total_guests_invited" />
          </div>

          <div>
            <div class="mb-4">
              <span class="stats-progress-label">RSVP Guests ({{ Math.floor((dashboardStore.stats.guests_rsvp / dashboardStore.stats.total_guests_invited) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((dashboardStore.stats.guests_rsvp / dashboardStore.stats.total_guests_invited) * 100)"
                text-inside
                :stroke-width="20"
              >
                <span>{{ dashboardStore.stats.guests_rsvp }}</span>
              </el-progress>
            </div>
            <div class="mb-4">
              <span class="stats-progress-label">Information Only Guests ({{ Math.floor((dashboardStore.stats.guests_info_only / dashboardStore.stats.total_guests_invited) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((dashboardStore.stats.guests_info_only / dashboardStore.stats.total_guests_invited) * 100)"
                text-inside
                :stroke-width="20"
                color="#E6A23C"
              >
                <span>{{ dashboardStore.stats.guests_info_only }}</span>
              </el-progress>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="statistics-card">
          <div>
            <div class="card-header">
              Response Rate
              <el-tooltip
                content="Percentage of responses"
                placement="right"
                :show-after="500"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
            <el-statistic :value="dashboardStore.responseRate" suffix="%" />
          </div>

          <div>
            <div v-for="(item, i) in dashboardStore.attendanceBreakdown" :key="item.name" :class="{'mb-4': i < dashboardStore.attendanceBreakdown.length - 1}">
              <span class="stats-progress-label">{{item.name}} ({{ Math.floor((item.value / dashboardStore.stats.guests_rsvp) * 100) }}%)</span>
              <el-progress 
                :percentage="Math.floor((item.value / dashboardStore.stats.guests_rsvp) * 100)"
                text-inside
                :stroke-width="20"
                :color="getColor(item.name)"
              >
                <span>{{ item.value }}</span>
              </el-progress>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>

  <div v-if="dashboardStore.stats && !dashboardStore.loading" class="dashboard-content">
    <!-- Guests Invited Section -->
    <el-card class="stat-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Total Guests Invited</span>
          <el-icon><User /></el-icon>
        </div>
      </template>
      <div class="stat-content">
        <div class="main-stat">{{ dashboardStore.stats.total_guests_invited }}</div>
        <el-divider />
        
        <!-- By Invitation Type -->
        <div class="sub-stats">
          <el-tag type="info" size="large">RSVP: {{ dashboardStore.stats.guests_rsvp }}</el-tag>
          <el-tag type="info" size="large">Info Only: {{ dashboardStore.stats.guests_info_only }}</el-tag>
        </div>

        <!-- By Family Side -->
        <el-divider>Family Side</el-divider>
        <div class="sub-stats">
          <el-tag effect="plain">Bride: {{ dashboardStore.stats.guests_bride_side }}</el-tag>
          <el-tag effect="plain">Groom: {{ dashboardStore.stats.guests_groom_side }}</el-tag>
          <el-tag effect="plain">Mutual: {{ dashboardStore.stats.guests_mutual }}</el-tag>
        </div>

        <!-- By Category -->
        <el-divider>Categories</el-divider>
        <div class="sub-stats">
          <el-tag 
            v-for="cat in dashboardStore.guestsByCategory" 
            :key="cat.name"
            effect="plain"
          >
            {{ cat.name }}: {{ cat.value }}
          </el-tag>
        </div>

        <!-- By Type -->
        <el-divider>Types</el-divider>
        <div class="sub-stats">
          <el-tag 
            v-for="type in dashboardStore.guestsByType" 
            :key="type.name"
            effect="plain"
            type="success"
          >
            {{ type.name }}: {{ type.value }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- Attendance Breakdown -->
    <el-card class="stat-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Attendance Breakdown</span>
          <el-icon><Checked /></el-icon>
        </div>
      </template>
      <div class="stat-content">
        <div 
          v-for="item in dashboardStore.attendanceBreakdown" 
          :key="item.name"
          class="attendance-item"
        >
          <span class="attendance-label">{{ item.name }}</span>
          <el-tag :type="item.type" size="large">{{ item.value }}</el-tag>
        </div>
        
        <el-divider />
        
        <el-progress 
          :percentage="dashboardStore.responseRate" 
          :color="dashboardStore.responseRate > 75 ? '#67C23A' : '#E6A23C'"
        >
          <span class="progress-label">Response Rate</span>
        </el-progress>
      </div>
    </el-card>

    <!-- Invitations -->
    <el-card class="stat-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Invitations</span>
          <el-icon><Message /></el-icon>
        </div>
      </template>
      <div class="stat-content">
        <div class="invitation-stats">
          <div class="invitation-item">
            <span class="label">Sent</span>
            <el-tag type="success" size="large">{{ dashboardStore.stats.invitations_sent }}</el-tag>
          </div>
          <div class="invitation-item">
            <span class="label">Not Sent</span>
            <el-tag type="warning" size="large">{{ dashboardStore.stats.invitations_not_sent }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Recent Responses -->
    <el-card class="stat-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Recent Responses</span>
          <el-icon><Clock /></el-icon>
        </div>
      </template>
      <div class="stat-content">
        <div class="recent-stats">
          <div class="recent-item">
            <span class="label">Last 7 Days</span>
            <el-tag type="primary" size="large">{{ dashboardStore.stats.responses_last_7_days }}</el-tag>
          </div>
          <div class="recent-item">
            <span class="label">Last 30 Days</span>
            <el-tag type="primary" size="large">{{ dashboardStore.stats.responses_last_30_days }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { ElMessage, ElCol, ElRow, ElStatistic } from 'element-plus'
import { Refresh, User, Checked, Clock, Message, Warning } from '@element-plus/icons-vue'
// DEBUG: Commented out for production
// import { checkDashboardMath } from '@/utils/checkDashboardMath'
// import { checkSpouseCounts } from '@/utils/checkSpouseCounts'
// import { checkMissingSpouse } from '@/utils/checkMissingSpouse'

const dashboardStore = useDashboardStore()

const getColor = (name: string): string | any => {
  if(name === 'Attending') return '#67C23A'
  else if (name === 'Pending') return '#E6A23C'
  else return 'red'
}

const handleRefresh = async () => {
  try {
    await dashboardStore.refresh()
    ElMessage.success('Dashboard refreshed successfully')
  } catch (error) {
    ElMessage.error('Failed to refresh dashboard')
  }
}

onMounted(async () => {
  await dashboardStore.fetchStats()
  
  // DEBUG: Commented out for production
  // Make debugging functions available in browser console
  // if (typeof window !== 'undefined') {
  //   ;(window as any).checkDashboardMath = checkDashboardMath
  //   ;(window as any).checkSpouseCounts = checkSpouseCounts
  //   ;(window as any).checkMissingSpouse = checkMissingSpouse
  //   console.log('💡 Debug commands available:')
  //   console.log('   - checkDashboardMath() - verify overall statistics')
  //   console.log('   - checkSpouseCounts() - detailed spouse count analysis')
  //   console.log('   - checkMissingSpouse() - find missing spouse in UI views')
  // }
})
</script>

<style scoped>
.el-main {
  flex-direction: column;
  padding: 40px 40px 20px 40px;
}

.dashboard-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
}

.description {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.error-alert {
  margin-bottom: 20px;
}

.el-row {
  margin-bottom: 20px;
  min-height: 200px;
  align-items: stretch;
}

.statistics-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  height: 100%;
  background-color: white;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
}

.statistics-card .card-header {
  justify-content: flex-start;
  font-size: 14px;
  font-weight: normal;
  color: #5a5a5a;
}

.el-statistic {
  --el-statistic-content-font-size: 56px;
  --el-statistic-content-font-weight: bold;
}

.stats-progress-label {
  display: block;
  font-size: 12px;
  color: #5a5a5a;
  margin-bottom: 8px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.stat-card {
  height: 100%;
}

.highlight-card {
  grid-column: span 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.highlight-card :deep(.el-card__header) {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.highlight-card .card-header span,
.highlight-card .label,
.highlight-card .value {
  color: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.headcount-section {
  text-align: center;
}

.main-count {
  font-size: 64px;
  font-weight: 700;
  color: white;
  margin: 20px 0;
}

.breakdown {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item .label {
  font-size: 14px;
  opacity: 0.9;
}

.breakdown-item .value {
  font-size: 28px;
  font-weight: 600;
}

.stat-content {
  padding: 16px 0;
}

.main-stat {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  color: var(--el-color-primary);
  margin: 16px 0;
}

.sub-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.attendance-label {
  font-size: 16px;
  font-weight: 500;
}

.progress-label {
  font-weight: 600;
}

.invitation-stats,
.recent-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invitation-item,
.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.invitation-item .label,
.recent-item .label {
  font-size: 16px;
  font-weight: 500;
}

.footer-info {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .highlight-card {
    grid-column: span 1;
  }
  
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>