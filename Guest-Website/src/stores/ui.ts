import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    // Navigation states
    const activeSection = ref('')
  
    // Modal states
    const showModal = ref(false)
    const showWelcome = ref(false)

    // Loading states
    const isLoading = ref(false)
    const isGuestDataLoading = ref(false)

    // Modal functions
    const hideAllModals = () => {
        showModal.value = false
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
        showModal,
        showWelcome,

        // Functions
        hideAllModals,
        scrollToSection,
    }
})
