// @ts-nocheck
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '@/services/authService'
import { useRouter } from 'vue-router'
import { LoginData, UserData } from '@/types/authTypes'
import { useAppData } from '@/store/appliction/useAppData'

const TOKEN_EXPIRATION_HOURS = 24

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const appDataStore = useAppData()
  
  const isAuthenticated = ref(!!localStorage.getItem('token'))
  const isSubmitting = ref(false)
  const error = ref({
    isError: false,
    message: ''
  })

  const userData = ref<UserData>({
    avatar: null,
    name: '',
    status: 'offline'
  })

  // Вычисляемые свойства
  const userInitials = computed(() => {
    if (!userData.value.name) return '?'
    const parts = userData.value.name.split(' ')
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase()
  })

  const fetchUserData = async () => {
    try {
      // Здесь должен быть реальный запрос к API
      // Заглушка для демонстрации
      userData.value = {
        avatar: null,
        name: 'Тест Тестов',
        status: 'online'
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error)
    }
  }
  
  const login = async (credentials:LoginData) => {
    try {
      isSubmitting.value = true
      error.value = { isError: false, message: '' }
      
      const response = await AuthService.login(credentials)
      const { type, data: responseData } = response.DATA
      console.log('response', response);
      if (type === 'success' && responseData.id) {
        await handleSuccessfulLogin(responseData.id)
      } else if (type === 'error' && responseData.MESSAGE) {
        throw new Error(responseData.MESSAGE)
      } else {
        throw new Error('Неизвестный тип ответа от сервера')
      }
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }
  
  const handleSuccessfulLogin = async (token: string) => {
    // await appDataStore.initAppData()

    const expiresIn = TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
    
    localStorage.setItem('token', token)
    localStorage.setItem('tokenExpiration', (Date.now() + expiresIn).toString())
    isAuthenticated.value = true
    

    // await appDataStore.initAppData();
    await router.push('/2d')
  }
  
  const handleError = (err: unknown) => {
    let message = 'Произошла неизвестная ошибка'
    
    if (err instanceof Error) {
      message = err.message
    }
    
    error.value = {
      isError: true,
      message
    }
    
    setTimeout(() => {
      error.value.isError = false
    }, 3000)
  }
  
  const logout = async () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiration')
      isAuthenticated.value = false
      userData.value = {
        avatar: null,
        name: '',
        status: 'offline'
      }
      
      // Перенаправляем на страницу входа
      await router.push('/auth')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      // Форсированный выход при ошибке
      localStorage.clear()
      await router.push('/auth')
    }
  }
  
  return {
    isAuthenticated,
    isSubmitting,
    error,
    userData,
    userInitials,
    fetchUserData,
    login,
    logout
  }
})