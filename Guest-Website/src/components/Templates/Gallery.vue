<template>
    <section id="gallery" class="pt-80 pb-48 flex flex-col items-center overflow-x-hidden">
        <div class="flex gap-4 items-center mb-20">
            <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
            <h4 class="text-heading-s text-brand-pri">Media Gallery</h4>
            <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
        </div>
        <h3 class="text-neutrals-neu-0 text-heading-md mb-40">Follow the celebration</h3>
        
        <!-- Pinterest-style 2-column grid -->
        <div class="w-full max-w-4xl px-24">
            <div class="columns-2 gap-6 mb-32 sm:columns-3">
                <div 
                    v-for="(item, index) in allMediaItems" 
                    :key="`media-${index}`"
                    class="cursor-pointer mb-6 break-inside-avoid"
                >
                    <img 
                        v-if="item.type === 'image'"
                        :src="item.src" 
                        :alt="item.alt"
                        class="w-full object-contain"
                        loading="lazy"
                    />
                    <div 
                        v-else-if="item.type === 'video'"
                        class="relative overflow-hidden"
                    >
                        <video 
                            :src="item.src"
                            class="w-full object-contain"
                            muted
                            playsinline
                        />
                        <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-brand-pri ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- View All Button -->
            <div class="flex justify-center">
                <Button 
                    label="View Full Gallery" 
                    type="tertiary"
                    class="px-32"
                />
            </div>
        </div>
        
        <!-- Lightbox -->
        <!-- <MediaLightbox 
            v-if="showLightbox"
            :media-items="allMediaItems"
            :current-index="currentLightboxIndex"
            @close="closeLightbox"
            @navigate="navigateLightbox"
            @goTo="(index) => currentLightboxIndex = index"
        /> -->
    </section>
</template>

<script setup lang="ts">
interface MediaItem {
    type: 'image' | 'video'
    src: string
    alt: string
}

// Sample media data - replace with your actual media
const allMediaItems = ref<MediaItem[]>([
    {
        type: 'image',
        src: 'https://picsum.photos/400/600?random=1',
        alt: 'Wedding photo 1',
    },
    {
        type: 'image', 
        src: 'https://picsum.photos/400/400?random=2',
        alt: 'Wedding photo 2',
    },
    {
        type: 'video',
        src: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
        alt: 'Wedding video 1',
    },
    {
        type: 'image',
        src: 'https://picsum.photos/400/500?random=4',
        alt: 'Wedding photo 4',
    },
    {
        type: 'image',
        src: 'https://picsum.photos/400/350?random=5',
        alt: 'Wedding photo 5',
    },
    {
        type: 'image',
        src: 'https://picsum.photos/400/450?random=6',
        alt: 'Wedding photo 6',
    }
])

// State
// const showLightbox = ref(false)
// const currentLightboxIndex = ref(0)
// const previewCount = ref(6) // Number of items to show in preview

// Computed
// const previewItems = computed(() => allMediaItems.value.slice(0, previewCount.value))

// Pinterest-style distribution: alternate between columns with height balancing
/* const column1Items = computed(() => {
    const column1: MediaItem[] = []
    let column1Height = 0
    let column2Height = 0
    
    previewItems.value.forEach((item, index) => {
        if (index % 2 === 0 || column1Height <= column2Height) {
            column1.push(item)
        }
    })
    
    return column1
})

const column2Items = computed(() => {
    const column1Ids = new Set(column1Items.value.map(item => item.id))
    return previewItems.value.filter(item => !column1Ids.has(item.id))
})

// Methods
const getOriginalIndex = (item: MediaItem): number => {
    return allMediaItems.value.findIndex(media => media.id === item.id)
} */

/* const openLightbox = (index: number) => {
    currentLightboxIndex.value = index
    showLightbox.value = true
}

const closeLightbox = () => {
    showLightbox.value = false
}

const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentLightboxIndex.value > 0) {
        currentLightboxIndex.value = currentLightboxIndex.value - 1
    } else if(currentLightboxIndex.value < allMediaItems.value.length - 1) {
        currentLightboxIndex.value = currentLightboxIndex.value + 1
    }
}

const openFullGallery = () => {
    // Show all items and open lightbox at first item
    openLightbox(0)
} */
</script>

<style scoped>
</style>