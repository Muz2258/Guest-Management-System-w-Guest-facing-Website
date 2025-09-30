import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useIconPreloader } from './composables/useIconPreloader'
import router from './router'
import App from './App.vue'
import './styles/main.css'

(async () => {
  const { preloadAllIcons } = useIconPreloader()
  try {
    console.log('⏳ Preloading all icons...')
    await preloadAllIcons()
    console.log('✅ Icons preloaded successfully')
  }catch (error) {
    console.error('❌ Failed to preload icons:', error)
  }

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  app.mount('#app')
})()
