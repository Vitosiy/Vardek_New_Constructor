import { createApp } from 'vue'


import '@vueform/slider/themes/default.css'
import '@vueform/toggle/themes/default.css'
import '@/style.scss'

import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
const pinia = createPinia()


createApp(App).use(pinia).use(router).mount('#app')
