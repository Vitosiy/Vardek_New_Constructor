import { createApp } from 'vue'


import '@vueform/slider/themes/default.css'
import '@vueform/toggle/themes/default.css'
import '@/style.scss'

import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import { useAppData } from './store/appliction/useAppData' 

async  function bootStore() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Ждём загрузки данных до монтирования
  const appDataStore = useAppData()
  await appDataStore.initAppData()

  app.mount('#app')
}
bootStore()
