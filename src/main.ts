import { createApp } from 'vue'
import '@vueform/slider/themes/default.css'
import '@vueform/toggle/themes/default.css'
import '@/style.scss'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { COOKIE_NAMES, getCookie } from './components/authorization/utils/cookieUtils'
import { useAppData } from './store/appliction/useAppData'

// Функция для загрузки скриптов
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}
// Загрузки скриптов для детального описание карточки товара общего каталога
async function loadDependencies() {
  try {
    await loadScript('/lib/jquery-3.4.1.min.js')
    await loadScript('/lib/jquery-migrate-3.1.0.min.js')
    await loadScript('/lib/jquery-ui.min.js')
    await loadScript('/lib/jquery.fancybox.pack.js')
    await loadScript('/lib/toastr.min.js')
    await loadScript('/lib/bootstrap.min.js')
    await loadScript('/lib/bootstrap-select.min.js')
    await loadScript('/lib/custom_slider.js')
  } catch (error) {
    console.error('Error loading dependencies:', error)
  }
}

// async function bootApp() {


//   const app = createApp(App)
//   const pinia = createPinia()

//   app.use(pinia)
//   app.use(router)

//   await router.isReady()

//   const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
  
//   if (!token) {
//     // Нет токена — показываем /auth
//     if (router.currentRoute.value.path !== '/auth') {
//       await router.push('/auth')
//     }
//     app.mount('#app')
//     return
//   }

//   // Есть токен — начинаем загрузку данных
//   // Пока данные не загрузились — остаёмся на /auth
//   if (router.currentRoute.value.path !== '/auth') {
//     await router.push('/auth')
//   }

//   // Данные загрузились — редиректим в /2d
//   await router.push('/2d')

//   app.mount('#app')
// }

async function bootApp() {
  await loadDependencies()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  await router.isReady()

  const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
  const appDataStore = useAppData()
  await appDataStore.initAppData()

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


  // Данные загрузились — редиректим в /2d
  await router.push('/2d')

  app.mount('#app')

}

bootApp()
