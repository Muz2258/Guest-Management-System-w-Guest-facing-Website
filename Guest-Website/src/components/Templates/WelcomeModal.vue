<template>
    <Modal @close="handleClose" :is-visible="isVisible">
        <template #body>
            <div class="px-24 py-16">
                <p class="text-center text-neutrals-neu-35 text-xs mb-8">Welcome</p>
                <h3 class="text-center text-heading-lg text-neutrals-neu-0 mb-20">
                    {{ guestDisplayName }}
                </h3>
                <p class="text-neutrals-neu-35 text">
                    We're so excited to celebrate with you on our special day. Take the time to:
                </p>
                <ul class="list-disc list-inside mt-8 text-neutrals-neu-35 text">
                    <li>Explore our big day details</li>
                    <li v-if="canRsvp">Update your RSVP <span class="text-brand-accent">(Required)</span></li>
                    <li v-if="canAddPlusOne">Add your plus one</li>
                    <li>Spoil us with gifts 😜</li>
                    <li>and get ready to party! 💃🏾🕺🏾</li>
                </ul>
            </div>
        </template>

        <template #footer>
            <div class="flex flex-col gap-8 items-center px-24 pb-24">
                <Button v-if="canRsvp" label="RSVP Now" type="primary" class="w-full" @click="goToRSVP" />
                <Button label="View Details" type="secondary" class="w-full" @click="goToDetails" />
                <Button label="See Gallery" type="tertiary" class="w-full" @click="goToGallery" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()
const uiStore = useUIStore()


/* ------------------ Props and Emits --------------------- */
interface Props {
    isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ------------------ Computed Properties ------------------ */
const guest = computed(() => guestStore.guestData?.guest)
const guestPermissions = computed(() => guestStore.guestData?.permissions)
const canAddPlusOne = computed(() => guestPermissions.value?.can_bring_plus_one)
const canRsvp = computed(() => guestPermissions.value?.can_rsvp)
const isVisible = computed(() => props.isVisible)

const guestDisplayName = computed(() => {
  if (!guest.value) {
    return 'Honored Guest'
  }
  
  const title = guest.value.name.titles || null
  const firstName = guest.value.name.first_name || ''
  const lastName = guest.value.name.last_name || ''
  const isCouple = guestPermissions.value?.is_couple
  
  if (isCouple && lastName) {
    return `Mr. & Mrs. ${lastName}`
  }else {
    return `${title ? title : ''} ${firstName}`
  }
})


/* ------------------ Functions ------------------ */
const handleClose = () => {
    uiStore.showHideWelcomeModal(false)
}

const goToRSVP = () => {
    const rsvpSection = 'rsvp'
    uiStore.scrollToSection(rsvpSection)
}

const goToDetails = () => {
    const detailsSection = 'details'
    uiStore.scrollToSection(detailsSection)
}

const goToGallery = () => {
    const gallerySection = 'gallery'
    uiStore.scrollToSection(gallerySection)
}
</script>

<style scoped>

</style>