<template>
  <div class="flex space-x-8 w-full">
    <div class="flex flex-col items-center space-y-2 px-6 pt-8">
      <div class="size-12 rounded-full bg-brand-pri"></div>
      <div
        v-if="!isLast"
        class="w-[1px] flex grow bg-brand-sec"
      ></div>
    </div>
    <div class="flex flex-col pb-32">
      <h3 class="text-heading-md text-neutrals-neu-0 mb-16">{{ sessionTitle }}</h3>
      <div v-if="locationName || locationAddress" class="flex gap-4 mb-16">
        <Icon name="location-pin" :size="16" :color="getColor('neutral.neu_35')" class="mt-4"/>
        <div class="flex flex-col gap-4">
          <p class="text-neutrals-neu-0 text">{{ locationName }}</p>
          <p class="text-neutrals-neu-35 text-s">{{ locationAddress }}</p>
          <button 
            v-if="locationCoordinates" 
            @click="handleDirectionsClick"
            class="text-brand-pri text-s underline mt-8 text-left"
          >
            {{ isMobileDevice ? 'Get Directions' : 'Open in Google Maps' }}
          </button>
        </div>
      </div>
      <div v-if="startTime || endTime" class="flex gap-4 mb-16">
        <Icon name="alarm-clock" :size="16" :color="getColor('neutral.neu_35')" class="mt-4"/>
        <div class="flex flex-col gap-4">
          <p class="text-neutrals-neu-0 text">{{ startTime }} - {{ endTime }}</p>
        </div>
      </div>
      <p v-if="remarks" class="text-neutrals-neu-35 text-s mb-8">{{ remarks }}</p>
      <p v-if="notices" v-for="(notice, i) in notices" class="text-denotive-red text-s" :class="{'mb-8': i < notices.length - 1}">IMPORTANT! {{ notice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ------------------ Imports ------------------ */
import { getColor } from '../../utils/colors';
import Icon from '../Icon';
import type { SessionDetail } from '../../types/event';


/* ------------------ Props and Emitters ------------------ */
const props = defineProps<SessionDetail & { isLast: boolean }>();


/* ------------------ Computed Properties ------------------ */
const isMobileDevice = computed(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});


/* ------------------ Methods ------------------ */
const handleDirectionsClick = () => {
  if (!props.locationCoordinates) return;

  const [lat, lng] = props.locationCoordinates.split(',').map(coord => coord.trim())

  if(isMobileDevice.value) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      window.location.href = `geo:${lat},${lng}?q=${lat},${lng}`;
    } else if (isIOS) {
      window.location.href = `maps://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}`;
    } else {
      window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15`, '_blank');
    }
  } else {
    window.open(`maps://maps.google.com/maps?q=${lat},${lng}`, '_blank');
  }
};
</script>