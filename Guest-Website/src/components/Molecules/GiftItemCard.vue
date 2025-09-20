<template>
  <div>
    <div class="flex flex-col gap-12" >
        <div class="flex gap-16 min-h-[100px]">
            <img :src="item.image_url" :alt="item.name" class="w-[100px] object-cover bg-neutrals-neu-96" />
            <div class="flex flex-col justify-between flex-grow">
                <div class="flex flex-col gap-4">
                    <h4 class="font-body text-md text-neutrals-neu-0 line-clamp-1">{{ item.name }}</h4>
                    <p class="text text-neutrals-neu-0 font-semibold">{{ currency(item.price) }}</p>
                    <!-- <a v-if="!isFullyFunded" :href="item.external_link" class="text-xs text-brand-pri underline">View on {{ item.store_name ? item.store_name : 'store' }}</a> -->
                </div>

                <p v-if="isFullyFunded" class="text-s text-brand-accent">Fully Funded!</p>
            </div>
        </div>

        <div v-if="hasContributions && !isFullyFunded" class="flex flex-col gap-8">
            <div class="w-full bg-denotive-green-light rounded-full h-8">
                <div class="bg-brand-accent h-8 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
            <div class="flex justify-between items-center text-xs text-neutrals-neu-0 font-semibold mb-4">
                <p>{{ item.contributors }} <span class="text-neutrals-neu-35 font-normal">{{ item.contributors > 1 ? 'contributors' : 'contributor' }}</span></p>
                <p>{{ currency(item.amount_contributed) }} <span class="text-neutrals-neu-35 font-normal">raised</span></p>
            </div>
        </div>

        <div v-if="hasActions" class="flex gap-8">
          <Button 
            v-if="!hasContributions"
            label="Buy" 
            @click="handleBuy"
            class="flex-1"
            type="primary"
          />
          <Button
            v-if="!isFullyFunded"
            label="Contribute" 
            @click="handleContribute"
            class="flex-1"
            type="secondary"
          />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ------------------- Imports ------------------- */
import type { GiftItem } from '../../types/guests'


/* ------------------- Local Type Definitions --------------------- */
interface Props {
  item: GiftItem,
  hasActions: boolean
}

interface Emitters {
  (e: 'buy', item: GiftItem): void
  (e: 'contribute', item: GiftItem): void
}


/* -------------------- Stores ------------------ */
const { currency } = useCurrency()


/* -------------------- Props and Emits ------------------ */
const props = withDefaults(defineProps<Props>(), {
    hasActions: true
})

const emit = defineEmits<Emitters>()


/* ------------------- Computed Properties ------------------- */
const isFullyFunded = computed(() => props.item.price <= props.item.amount_contributed)
const hasContributions = computed(() => props.item.amount_contributed > 0)
const progressPercentage = computed(() => (props.item.amount_contributed / props.item.price) * 100)


/* ------------------- Methods ------------------- */
const handleBuy = () => {
  console.log('Buy clicked. Sending item to parent')
  emit('buy', props.item)
}

const handleContribute = () => {
  console.log('Contribute clicked. Sending item to parent')
  emit('contribute', props.item)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
