<template>
  <div 
    :class="containerStyle"
  >
    <div class="max-w-6xl mx-auto p-24 h-full">
      <!-- Simple Banner Mode -->
      <div v-if="!showDetails" class="space-y-16">
        <div class="flex flex-col md:flex-row md:items-center gap-24">
          <div class="flex-1">
            <p class="text-s text-neutrals-neu-100">
              We use essential cookies to remember your invitation and improve your experience. 
              <button 
                @click="handleShowDetails" 
                class="text-neutrals-neu-100 hover:text-neutrals-neu-100 underline"
              >
                Customize settings
              </button> or 
              <a href="/privacy-policy" class="text-neutrals-neu-100 hover:text-neutrals-neu-100 underline">
                learn more
              </a>.
            </p>
          </div>
          
          <div class="flex gap-8 min-w-fit">
            <Button 
              label="Accept All" 
              type="alt-solid" 
              @click="acceptAll"
              class="whitespace-nowrap grow"
            />
            <Button 
              label="Essential Only" 
              type="alt-text" 
              @click="acceptEssential"
              class="whitespace-nowrap grow"
            />
          </div>
        </div>
      </div>

      <!-- Detailed Settings Mode -->
      <div v-else class="flex flex-col h-full space-y-24 ">
        <div class="flex items-center justify-between pb-16">
          <h3 class="text-heading-md text-neutrals-neu-0">Cookie Preferences</h3>
          <button 
            @click="showDetails = false"
            class="text-neutrals-neu-35 hover:text-neutrals-neu-0"
          >
            <Icon name="close" :size="20" />
          </button>
        </div>

        <div class="space-y-16 grow">
          <!-- Essential Cookies -->
          <div class="flex items-start justify-between p-16 bg-neutrals-neu-96 rounded-md">
            <div class="flex-1">
              <h4 class="text-heading-s text-neutrals-neu-0 mb-4">Essential Cookies</h4>
              <p class="text-s text-neutrals-neu-35 mb-8">
                Required for the website to function. These cannot be disabled.
              </p>
              <ul class="list-custom">
                <li>Authentication and security</li>
                <li>Basic website functionality</li>
              </ul>
            </div>
            <div class="ml-16">
              <span class="text-s text-neutrals-neu-35">Always Active</span>
            </div>
          </div>

          <!-- Functional Cookies -->
          <div class="flex items-start justify-between p-16 border border-neutrals-neu-96 rounded-md">
            <div class="flex-1">
              <h4 class="text-heading-s text-neutrals-neu-0 mb-4">Functional Cookies</h4>
              <p class="text-s text-neutrals-neu-35 mb-8">
                Remember your preferences and provide enhanced features.
              </p>
              <ul class="list-custom">
                <li>Remember your invitation details</li>
                <li>Faster loading on return visits</li>
                <li>Personalized welcome messages</li>
              </ul>
            </div>
            <div class="ml-16">
              <ToggleSwitch 
                label="Enable Functional Cookies"
                v-model="tempPreferences.functional"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-8 justify-end">
          <Button 
            label="Reject All" 
            type="tertiary" 
            @click="rejectAll"
          />
          <Button 
            label="Save Preferences" 
            type="secondary" 
            @click="saveCustomPreferences"
          />
          <Button 
            label="Accept All" 
            type="primary" 
            @click="acceptAll"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import Icon from '../Icon'

// Stores
const privacyStore = usePrivacyStore()

// Local state
const showDetails = ref(false)
const tempPreferences = ref<ConsentPreferences>({
  essential: true,
  functional: false
})

// Computed
const containerStyle = computed (() => {
  const baseStyles = 'z-[100] top-0'
  const noDetails = 'bg-brand-accent sticky'
  const details = 'bg-neutrals-neu-100 fixed h-screen'

  return `${baseStyles} ${showDetails.value ? details : noDetails}`
})

// Methods
const handleShowDetails = () => {
  showDetails.value = true
  document.body.style.overflow = 'hidden'
}

const acceptAll = () => {
  privacyStore.acceptAll()
  showDetails.value = false
  document.body.style.overflow = ''
}

const acceptEssential = () => {
  privacyStore.acceptEssential()
  showDetails.value = false
  document.body.style.overflow = ''
}

const rejectAll = () => {
  privacyStore.rejectAll()
  showDetails.value = false
  document.body.style.overflow = ''
}

const saveCustomPreferences = () => {
  privacyStore.acceptCustom(tempPreferences.value)
  showDetails.value = false
  document.body.style.overflow = ''
}

// Watchers
watch(tempPreferences, (newVal) => {
  if(newVal) console.log('Temp Preferences Updated:', newVal)
}, { deep: true })

// Initialize
onMounted(() => {
  privacyStore.initializeConsent()
  tempPreferences.value = { ...privacyStore.preferences }
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Custom toggle switch styles are handled by Tailwind classes above */
</style>
