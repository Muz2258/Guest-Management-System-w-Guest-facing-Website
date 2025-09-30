import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useIconPreloader } from './composables/useIconPreloader'
import router from './router'
import App from './App.vue'
import './styles/main.css'

console.log('⏳ Preloading icons...')
await useIconPreloader().preloadAllIcons()
console.log('✅ Icons preloaded successfully')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
