<template>
    <Modal @close="handleClose" :is-visible="isVisible">
        <template #body>
            <div class="px-24 py-24">
                <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
                    Deleting your message?
                </h3>
                <p class="text-neutrals-neu-46 text-s text-center mb-32">
                    You are about to delete your message. This action cannot be undone. Your message will be permanently removed from our wall.
                </p>
            </div>
        </template>

        <template #footer>
            <div class="flex flex-col gap-8 w-full px-24 pb-24 pt-8">
                <Button 
                    label="Cancel" 
                    type="secondary" 
                    class="w-full" 
                    @click="handleClose"
                />
                <Button 
                    label="Delete Message" 
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
/* ----------------- Stores ----------------- */
const uiStore = useUIStore()
const goodWillStore = useGoodWillStore()
const guestStore = useGuestStore()


/* ----------------- Props and Emits ----------------- */
interface Props {
    isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ----------------- Computed Properties ----------------- */
const isDeleting = computed(() => goodWillStore.loading)
const isVisible = computed(() => props.isVisible)


/* ----------------- Functions ----------------- */
const handleClose = () => {
    uiStore.showHideDeleteGoodWillModal(false)
}

const handleDelete = async () => {
    const guestToken = guestStore.guestData?.auth_token

    if (!guestToken) {
        throw new Error('Guest token is missing. Cannot delete message.')
    }

    await goodWillStore.deleteGoodWillMessage(guestToken)
    
    uiStore.showHideDeleteGoodWillModal(false)
}
</script>


<style scoped>

</style>