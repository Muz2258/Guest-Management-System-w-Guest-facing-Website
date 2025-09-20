<template>
  <div class="flex flex-col gap-32">
    <GiftItemCard
      v-if="!isFetching"
      v-for="item in giftStore.sortedGiftItems"
      :key="item.gift_item_id"
      :item="item"
      :has-actions="true"
      @buy="handleBuy(item)"
      @contribute="handleContribute(item)"
    />
    <LoaderItemsList 
      v-else
      v-for="n in 4"
      :key="n"
    />
  </div>
</template>

<script setup lang="ts">
import type { GiftItem } from '@/types/guests'


/* ------------------ Stores ------------------- */
const giftStore = useGiftStore()


/* ------------------ Local Type Definitions --------------------- */
interface Emitters {
  (e: 'buy', item: GiftItem): void
  (e: 'contribute', item: GiftItem): void
}


/* ------------------ Emits ------------------- */
const emit = defineEmits<Emitters>()


/* ------------------ Computed Properties ------------------- */
const isFetching = computed(() => giftStore.fetching)


/* ------------------ Methods ------------------- */
const handleBuy = (item: GiftItem) => {
  console.log('Recieved event from child, sending to grandparent:', item)
  emit('buy', item)
}

const handleContribute = (item: GiftItem) => {
  console.log('Recieved event from child, sending to grandparent:', item)
  emit('contribute', item)
}


/* ------------------ Lifecycle Hooks ------------------- */
onMounted(() => {
  if (giftStore.giftItems.length === 0) {
    giftStore.fetchGiftItems()
  }
})
</script>
