import { ApiResponse, LoginData } from '@/types/authTypes'
import axios from 'axios'

const API_URL = 'https://dev.vardek.online'
const REQUEST_TIMEOUT = 10000

export const AuthService = {
  async login(credentials: LoginData): Promise<ApiResponse> {
    try {
      const { data } = await axios.post<ApiResponse>(
        `${API_URL}/api/modeller/auth/login/`,
        {
          login: credentials.login.trim(),
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: REQUEST_TIMEOUT
        }
      )
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка при подключении к серверу')
      }
      throw error
    }
  },

  async getUserData(token: string): Promise<ApiResponse> {
    try {
      const { data } = await axios.post<ApiResponse>(
        `${API_URL}/api/modeller/auth/login/`,
        {
          token: token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: REQUEST_TIMEOUT
        }
      )
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка при подключении к серверу')
      }
      throw error
    }
  },
}