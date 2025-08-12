import { createApp } from 'vue'
import '@vueform/slider/themes/default.css'
import '@vueform/toggle/themes/default.css'
import '@/style.scss'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAppData } from './store/appliction/useAppData'

async function bootApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  await router.isReady()

  const token = localStorage.getItem('token')
  const appDataStore = useAppData()

  if (!token) {
    // Нет токена — показываем /auth
    if (router.currentRoute.value.path !== '/auth') {
      await router.push('/auth')
    }
    app.mount('#app')
    return
  }

  // Есть токен — начинаем загрузку данных
  // Пока данные не загрузились — остаёмся на /auth
  if (router.currentRoute.value.path !== '/auth') {
    await router.push('/auth')
  }

  await appDataStore.initAppData()

  // Данные загрузились — редиректим в /2d
  await router.push('/2d')

  app.mount('#app')
}

bootApp()
