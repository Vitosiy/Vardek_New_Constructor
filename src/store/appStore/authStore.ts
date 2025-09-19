// @ts-nocheck
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '@/services/authService'
import { useRouter } from 'vue-router'
import { LoginData, UserData } from '@/types/authTypes'
import { useAppData } from '@/store/appliction/useAppData'
import { setCookie, getCookie, deleteCookie, COOKIE_NAMES } from '@/components/authorization/utils/cookieUtils'

const TOKEN_EXPIRATION_HOURS = 24

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const appDataStore = useAppData()
  
  const isAuthenticated = ref(!!getCookie(COOKIE_NAMES.AUTH_TOKEN))
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
      const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await AuthService.getUserData(token);
      
      // Логируем ответ только в development режиме
      if (process.env.NODE_ENV === 'development') {
        console.log('Ответ сервера:', response);
      }

      // Проверяем структуру ответа
      if (!response?.DATA) {
        throw new Error('Некорректная структура ответа сервера');
      }

      const { type, data } = response.DATA;

      // Обрабатываем ошибку от сервера
      if (type === 'error') {
        throw new Error('Ошибка авторизации: неверный токен');
      }

      // Проверяем наличие данных пользователя
      if (!data?.user) {
        throw new Error('Данные пользователя не получены');
      }

      const user = data.user;

      // Проверяем активность пользователя
      if (user.ACTIVE !== "Y") {
        throw new Error('Пользователь неактивен');
      }

      // Формируем данные пользователя
      userData.value = {
        avatar: user.PERSONAL_PHOTO || null,
        name: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || 'Пользователь',
        status: 'online',
        // Добавляем дополнительные полезные поля
        id: user.ID,
        email: user.EMAIL,
        login: user.LOGIN
      };
      return userData.value;

    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      
      // Определяем тип ошибки для соответствующей обработки
      const errorMessage = error.message.toLowerCase();
      const isAuthError = errorMessage.includes('авторизации') || 
                        errorMessage.includes('токен') ||
                        errorMessage.includes('неактивен');

      if (isAuthError) {
        await logout();
      }
      
      // Пробрасываем ошибку дальше для обработки в вызывающем коде
      throw error;
    }
  };

  const login = async (credentials: LoginData) => {
    try {
      isSubmitting.value = true
      error.value = { isError: false, message: '' }
      
      const response = await AuthService.login(credentials)
      const { type } = response.DATA
      
      if (type === 'success' && response.DATA.token) {
        await handleSuccessfulLogin(response.DATA.token)
      } else if (type === 'error' && response.DATA.MESSAGE) {
        throw new Error(response.DATA.MESSAGE)
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
    // Сохраняем токен в cookie
    setCookie(COOKIE_NAMES.AUTH_TOKEN, token, TOKEN_EXPIRATION_HOURS / 24)
    
    // Сохраняем время истечения токена
    const expirationTime = Date.now() + (TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000)
    setCookie(COOKIE_NAMES.TOKEN_EXPIRATION, expirationTime.toString(), TOKEN_EXPIRATION_HOURS / 24)
    
    isAuthenticated.value = true
    await appDataStore.initAppData()

    // Загружаем данные пользователя
    // await fetchUserData().then(res => {
    //   console.log(res);
    // })
    // await appDataStore.initAppData()
    
    // await router.push('/2d')
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
      // Удаляем cookies
      deleteCookie(COOKIE_NAMES.AUTH_TOKEN)
      deleteCookie(COOKIE_NAMES.TOKEN_EXPIRATION)
      
      // Очищаем localStorage на всякий случай
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
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        deleteCookie(name)
      })
      localStorage.clear()
      await router.push('/auth')
    }
  }

  // Функция для проверки истечения токена
  const checkTokenExpiration = (): boolean => {
    const expiration = getCookie(COOKIE_NAMES.TOKEN_EXPIRATION)
    if (!expiration) return true
    
    const expirationTime = parseInt(expiration)
    return Date.now() > expirationTime
  }

  // Автоматическая проверка токена при инициализации
  if (isAuthenticated.value && checkTokenExpiration()) {
    logout()
  }

  return {
    isAuthenticated,
    isSubmitting,
    error,
    userData,
    userInitials,
    fetchUserData,
    login,
    logout,
    checkTokenExpiration
  }
})