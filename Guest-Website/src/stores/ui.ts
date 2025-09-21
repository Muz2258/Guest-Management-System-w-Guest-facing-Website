export const useUIStore = defineStore('ui', () => {
    // States
    const activeSection = ref('')
    const showCookie = ref(false)
    const showModal = ref(false)
    const showWelcomeModal = ref(false)
    const showPlusOneModal = ref(false)
    const showRemovePlusOneModal = ref(false)
    const showUpdateRSVPModal = ref(false)
    const showGoodWillModal = ref(false)
    const showDeleteGoodWillModal = ref(false)
    const showGiftBottomSheet = ref(false)
    const showGiftingForm = ref(false)
    const showGiftSummary = ref(false)
    const showContributingSheet = ref(false)
    const globalLoading = ref(false)

    const isLoading = ref(false)
    const isGuestDataLoading = ref(false)

    // Modal functions
    const hideAllBottomSheets = () => {
        showGiftBottomSheet.value = false
    }

    const hideAllModals = () => {
        showModal.value = false
        showWelcomeModal.value = false
        showPlusOneModal.value = false
        showGoodWillModal.value = false
        showRemovePlusOneModal.value = false
        showUpdateRSVPModal.value = false
        showDeleteGoodWillModal.value = false
    }

    const showHidePlusOneModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showPlusOneModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showHideRemovePlusOneModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showRemovePlusOneModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showHideUpdateRSVPModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showUpdateRSVPModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showHideGoodWillModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showGoodWillModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showHideDeleteGoodWillModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showDeleteGoodWillModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showHideWelcomeModal = (show: boolean) => {
        if(show) {
            hideAllModals()
            showWelcomeModal.value = true
        }else {
            hideAllModals()
        }
    }

    const showGiftFormSheet = () => {
        showGiftingForm.value = true
        showGiftSummary.value = false
    }

    const showGiftSummarySheet = () => {
        showGiftingForm.value = false
        showGiftSummary.value = true
    }

    const showGiftingSheet = () => {
        const prevFormState = showGiftingForm.value
        const prevSummaryState = showGiftSummary.value

        hideAllModals()
        if(!prevFormState && !prevSummaryState) {
            showGiftFormSheet()
        }else {
            showGiftingForm.value = prevFormState
            showGiftSummary.value = prevSummaryState
        }
        showGiftBottomSheet.value = true
    }

    const showHideBottomSheet = (show: boolean) => {
        showGiftBottomSheet.value = show
    }

    const showHideGiftingSheets = (sheet: 'gifting-form' | 'contribute-form' | 'summary') => {
      switch (sheet) {
        case 'gifting-form':
          showGiftingForm.value = true
          showContributingSheet.value = false
          showGiftSummary.value = false
          break;

        case 'contribute-form':
          showGiftingForm.value = false
          showContributingSheet.value = true
          showGiftSummary.value = false
          break;

        case 'summary':
          showGiftingForm.value = false
          showContributingSheet.value = false
          showGiftSummary.value = true
          break;

        default:
          showGiftingForm.value = true
          showContributingSheet.value = false
          showGiftSummary.value = false
          break;
      }
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

    const setGlobalLoading = (loading: boolean) => {
        globalLoading.value = loading
    }

    return {
        // State
        isLoading,
        showCookie,
        isGuestDataLoading,
        activeSection,
        showWelcomeModal,
        showPlusOneModal,
        showRemovePlusOneModal,
        showUpdateRSVPModal,
        showGoodWillModal,
        showDeleteGoodWillModal,
        showModal,
        showGiftingForm,
        showGiftSummary,
        showGiftBottomSheet,
        showContributingSheet,
        globalLoading,

        // Functions
        hideAllModals,
        hideAllBottomSheets,
        showHidePlusOneModal,
        showHideRemovePlusOneModal,
        showHideUpdateRSVPModal,
        showHideGoodWillModal,
        showHideDeleteGoodWillModal,
        showHideWelcomeModal,
        showGiftFormSheet,
        showGiftSummarySheet,
        scrollToSection,
        showGiftingSheet,
        showHideGiftingSheets,
        showHideBottomSheet,
        setGlobalLoading
    }
})
