<template>
    <Modal @close="handleClose">
        <template #body>
            <div class="px-24 py-24">
                <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
                    Rethinking your RSVP?
                </h3>
                <p class="text-neutrals-neu-46 text-s text-center mb-32">
                    Feel free to update your RSVP response below. We understand that plans can change, and we want to ensure we have the most accurate headcount for our special day.
                </p>
                
                <div class="flex flex-col gap-16">
                    <p class="text-center text-neutrals-neu-46 text-sm">
                        Current response: <span class="text-neutrals-neu-0">{{ currentRSVPText }}</span>
                    </p>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="px-24 pb-24">
                <div class="flex flex-col gap-12">
                    <Button 
                        label="Yes, I'll be there"
                        type="primary" 
                        class="w-full" 
                        :is-loading="isUpdating && selectedResponse === 'attending'"
                        @click="handleRSVPUpdate('attending')"
                    />
                    <Button 
                        label="Sorry, I can't make it"
                        type="secondary" 
                        class="w-full" 
                        :is-loading="isUpdating && selectedResponse === 'not_attending'"
                        @click="handleRSVPUpdate('not_attending')"
                    />
                    <Button 
                        label="Cancel"
                        type="tertiary" 
                        class="w-full" 
                        @click="handleCancel"
                    />
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
/* ---------------------- Stores ----------------------- */
const uiStore = useUIStore()
const rsvpStore = useRSVPStore()
const guestStore = useGuestStore()


/* ---------------------- Local Variables ----------------------- */
const selectedResponse = ref<'attending' | 'not_attending' | 'pending'>(rsvpStore.rsvpData?.attendance_status || 'pending')


/* ---------------------- Computed Properties --------------------- */
const isUpdating = computed(() => rsvpStore.loading)

const currentRSVPText = computed(() => {
    const status = rsvpStore.rsvpData?.attendance_status

    if (status === 'attending') return "Yes, I'll be there"
    if (status === 'not_attending') return "Sorry, I can't make it"

    return 'No response yet'
})


/* ---------------------- Functions ------------------------- */
const handleClose = () => {
    uiStore.showHideUpdateRSVPModal(false)
}

const handleRSVPUpdate = async (response: 'attending' | 'not_attending') => {
    console.log(`RSVP update requested: ${response}`);
    
    const guestToken = guestStore.guestData?.auth_token

    if(!guestToken) {
        throw new Error('No guest token found. Cannot update RSVP.')
    }

    selectedResponse.value = response

    await rsvpStore.updateGuestRsvp(guestToken, {
        attendance_status: response,
        spouse_attending: selectedResponse.value === 'attending' ? rsvpStore.rsvpData?.spouse_attending : null,
        plus_one_attending: null,
        plus_one_name: null
    })

    uiStore.showHideUpdateRSVPModal(false)
}

const handleCancel = () => {
    uiStore.showHideUpdateRSVPModal(false)
}
</script>

<style scoped>

</style>