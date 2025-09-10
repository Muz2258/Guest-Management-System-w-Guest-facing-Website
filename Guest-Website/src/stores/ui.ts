export const useUIStore = defineStore('ui', () => {
    // States
    const activeSection = ref('')
    const showCookie = ref(false)
    const showModal = ref(false)
    const showWelcome = ref(false)
    const showPlusOneForm = ref(false)
    const showRemovePlusOneDialog = ref(false)
    const showUpdateRSVPDialog = ref(false)
    const showWellWishesForm = ref(false)
    const isLoading = ref(false)
    const isGuestDataLoading = ref(false)

    // Modal functions
    const hideAllModals = () => {
        showModal.value = false
        showWelcome.value = false
        showPlusOneForm.value = false
        showWellWishesForm.value = false
        showRemovePlusOneDialog.value = false
        showUpdateRSVPDialog.value = false
    }

    const showPlusOneModal = () => {
        hideAllModals()
        showModal.value = true
        showPlusOneForm.value = true
    }

    const showWellWishesModal = () => {
        hideAllModals()
        showModal.value = true
        showWellWishesForm.value = true
    }

    const showRemovePlusOneModal = () => {
        hideAllModals()
        showModal.value = true
        showRemovePlusOneDialog.value = true
    }

    const showUpdateRSVPModal = () => {
        hideAllModals()
        showModal.value = true
        showUpdateRSVPDialog.value = true
    }

    // Navigation functions
    const scrollToSection = (sectionId: string) => {
        hideAllModals()

        // Use nextTick to ensure modal is closed before scrolling
        nextTick(() => {
            const element = document.getElementById(sectionId)
            if (element) {
                element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
                })
                activeSection.value = sectionId
            }
        })
    }

    return {
        // State
        isLoading,
        isGuestDataLoading,
        activeSection,
        showCookie,
        showWelcome,
        showPlusOneForm,
        showRemovePlusOneDialog,
        showUpdateRSVPDialog,
        showWellWishesForm,
        showModal,

        // Functions
        hideAllModals,
        showPlusOneModal,
        showRemovePlusOneModal,
        showUpdateRSVPModal,
        showWellWishesModal,
        scrollToSection,
    }
})
