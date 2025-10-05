<template>
  <section class="py-40 flex flex-col items-center overflow-x-hidden">
    <div class="mb-20">
      <DecorativeBranches variant="purple">
        <h4 class="text-heading-s text-brand-pri">Media Gallery</h4>
      </DecorativeBranches>
    </div>
    <h3 class="text-neutrals-neu-0 text-heading-md mb-40">Follow the celebration</h3>
      
    <!-- Pinterest-style 2-column grid -->
    <div class="w-full max-w-4xl px-24">
      <div class="columns-2 gap-6 mb-16">
        <div
          v-for="(item, index) in previewItems"
          :key="`media-${index}`"
          class="cursor-pointer mb-6 break-inside-avoid"
          @click="openGalleryPage(item.id)"
        >
          <MediaItem 
            :item="item"
          />
        </div>
      </div>
      
      <!-- View All Button -->
      <div class="flex justify-center">
          <Button 
              label="View all Photos & Videos" 
              type="tertiary"
              class="px-32"
              @click="openFullGallery"
          />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/* ------------------ Components ------------------- */
import DecorativeBranches from '../Atoms/DecorativeBranches.vue'

/* ------------------ Stores ------------------- */
const galleryStore = useGalleryStore()
const router = useRouter()

/* ------------------ Computed Properties ------------------- */
const previewItems = computed(() => {
  return galleryStore.getPreviewItems(6)
})

/* ------------------ Methods ------------------- */
const openGalleryPage = (id: string) => {
  router.push({ 
    name: 'media-viewer', 
    params: { imageID: id } 
  })
}

const openFullGallery = () => {
  router.push({ name: 'gallery' })
}

onMounted(() => {
  if(galleryStore.mediaItems.length === 0) {
    galleryStore.fetchMediaItems()
  }
})
</script>

<style scoped>
</style>