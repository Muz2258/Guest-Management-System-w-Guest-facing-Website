export const useUIStore = defineStore('ui', () => {
    // States
    const activeSection = ref('')
    const showCookie = ref(false)
    const showWelcome = ref(false)
    const isLoading = ref(false)
    const isGuestDataLoading = ref(false)

    // Modal functions
    const hideAllModals = () => {
        showWelcome.value = false
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

        // Functions
        hideAllModals,
        scrollToSection,
    }
})
