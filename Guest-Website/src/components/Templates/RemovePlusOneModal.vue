<template>
    <Modal @close="handleClose" :is-visible="isVisible">
        <template #body>
            <div class="px-24 py-24">
                <h3 class="text-heading-md text-center lining-nums text-neutrals-neu-0 mb-16">
                    Removing your +1?
                </h3>
                <p class="text-neutrals-neu-46 text-s text-center mb-32">
                    You are about to remove {{ plusOneName }} from your RSVP. This action cannot be undone.
                    If you change your mind, you can always add a new +1 later.
                </p>
            </div>
        </template>

        <template #footer>
            <div class="flex flex-col gap-8 px-24 pb-24 pt-16">
                <Button 
                    :label="'Keep my +1'"
                    type="secondary" 
                    class="w-full" 
                    @click="keepPlusOne"
                />
                <Button 
                    :label="'Remove my +1'"
                    type="primary" 
                    class="w-full" 
                    :is-loading="isDeleting"
                    @click="handleDelete"
                />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
/* ------------------ Stores ----------------- */
const uiStore = useUIStore()
const rsvpStore = useRSVPStore()
const guestStore = useGuestStore()


/* ------------------ Props and Emits ----------------- */
interface Props {
    isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ------------------ Computed Properties ----------------- */
const plusOneName = computed(() => {
  const plusOne = rsvpStore.rsvpData?.plus_one_data?.plus_ones?.[0]
  return plusOne ? `${plusOne.name.first_name} ${plusOne.name.last_name}` : 'your +1'
})
const isDeleting = computed(() => rsvpStore.loading)
const isVisible = computed(() => props.isVisible)


/* ------------------ Functions ----------------- */
const handleClose = () => {
    uiStore.showHideRemovePlusOneModal(false)
}

const handleDelete = async () => {
    const guestToken = guestStore.guestData?.auth_token
    const plusOneID = rsvpStore.rsvpData?.plus_one_data?.plus_ones?.[0]?.plus_one_id
    const plusOneType = rsvpStore.rsvpData?.plus_one_data?.plus_ones?.[0]?.type
    const plusOneName = rsvpStore.rsvpData?.plus_one_data?.plus_ones?.[0]?.name

    if(!guestToken) {
        throw new Error('No guest token found. Cannot remove plus one.')
    }

    if(!plusOneID) {
        throw new Error('No plus one found to remove.')
    }

    await rsvpStore.managePlusOneData(guestToken, 'delete', {
        p_plus_one_id: plusOneID,
        plus_one_type: plusOneType,
        plus_one_name: plusOneName
    })

    uiStore.showHideRemovePlusOneModal(false)
}

const keepPlusOne = () => {
    uiStore.showHideRemovePlusOneModal(false)
}
</script>

<style scoped>

</style>