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

const pinia = createPinia()
const app = createApp(App)

app.use(pinia).use(router)

// Проверяем токен при загрузке приложения
router.isReady().then(() => {
    
  const token = localStorage.getItem('token')
  
  // Если токена нет, перенаправляем на страницу авторизации
  if (!token && router.currentRoute.value.path !== '/auth') {
    router.push('/auth')
  }
  
  // Если токен есть и пользователь на странице авторизации, перенаправляем на 2D
  if (token && router.currentRoute.value.path === '/auth') {
    router.push('/2d')
  }
  
  app.mount('#app')
})
