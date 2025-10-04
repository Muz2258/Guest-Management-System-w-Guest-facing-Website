<template>
    <Modal @close="handleClose" :is-visible="isVisible">
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
                        :label="buttonLabel"
                        type="primary" 
                        class="w-full" 
                        :is-loading="isUpdating"
                        @click="handleRSVPUpdate(submitValue)"
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


/* ---------------------- Props and Emits ----------------------- */
interface Props {
    isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ---------------------- Local Variables ----------------------- */
const selectedResponse = ref<'attending' | 'not_attending' | 'pending'>(rsvpStore.rsvpData?.rsvp.attendance_status || 'pending')


/* ---------------------- Computed Properties --------------------- */
const isUpdating = computed(() => rsvpStore.loading)
const isVisible = computed(() => props.isVisible)

const currentRSVPText = computed(() => {
    const status = rsvpStore.rsvpData?.rsvp.attendance_status

    if (status === 'attending') return "Yes, I'll be there"
    if (status === 'not_attending') return "Sorry, I can't make it"

    return 'No response yet'
})

const buttonLabel = computed(() => {
    const status = rsvpStore.rsvpData?.rsvp.attendance_status

    if(status === 'attending') return "Update to 'Sorry, I can't make it'"
    return "Update to 'Yes, I'll be there'"
})

const submitValue = computed(() => {
    const status = rsvpStore.rsvpData?.rsvp.attendance_status

    if(status === 'attending') return 'not_attending'
    return 'attending'
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
        spouse_attending: selectedResponse.value === 'attending' ? rsvpStore.rsvpData?.rsvp.spouse_attending : null
    })

    uiStore.showHideUpdateRSVPModal(false)
}

const handleCancel = () => {
    uiStore.showHideUpdateRSVPModal(false)
}
</script>

<style scoped>

</style>