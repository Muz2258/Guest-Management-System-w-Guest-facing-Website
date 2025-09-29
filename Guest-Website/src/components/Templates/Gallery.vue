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
      <div class="columns-2 gap-6 mb-32">
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
          <!-- <div 
              v-for="(item, index) in previewItems" 
              :key="`media-${index}`"
              class="cursor-pointer mb-6 break-inside-avoid"
              @click="openGalleryPage(item.id)"
          >
              <img 
                  v-if="item.file_type === 'image'"
                  :src="item.s3_preview_url" 
                  :alt="item.filename"
                  class="w-full object-contain hover:opacity-90 transition-opacity rounded-lg"
                  loading="lazy"
              />
              <div 
                  v-else-if="item.file_type === 'video'"
                  class="relative overflow-hidden hover:opacity-90 transition-opacity rounded-lg"
              >
                <video 
                  :src="item.s3_preview_url"
                  class="w-full object-contain"
                  muted
                  playsinline
                />
                <div class="absolute bottom-0 left-0 right-0 flex items-center justify-center">
                  <Icon name="video-solid" :color="getColor('neutral.neu_76')" :size="48" />
                </div>
              </div>
          </div> -->
      </div>
      
      <!-- View All Button -->
      <div class="flex justify-center">
          <Button 
              label="View all images" 
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
    name: 'gallery', 
    query: { image: id } 
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