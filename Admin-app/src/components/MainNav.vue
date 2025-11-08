<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const activeIndex = computed(() => route.path)
</script>

<template>
  <el-menu
    class="main-nav"
    :router="true"
    :default-active="activeIndex"
  >
    <el-menu-item index="/">
      <template #title>
        Dashboard
      </template>
    </el-menu-item>
    <el-menu-item index="/guests">
      <template #title>
        Guests
      </template>
    </el-menu-item>
    <el-menu-item index="/goodwill-messages">
      <template #title>
        Goodwill Messages
      </template>
    </el-menu-item>
    <el-menu-item index="/seating">
      <template #title>
        Seating
      </template>
    </el-menu-item>
  </el-menu>
</template>

<style>
.main-nav {
  height: 100%;
  border-right: none;
}

.el-menu-item.is-active {
  font-weight: 600;
  border-right: 3px solid var(--el-color-primary);
}
</style>
