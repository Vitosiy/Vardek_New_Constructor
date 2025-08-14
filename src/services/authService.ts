import { client } from '@/api/api'
import { ApiResponse, LoginData } from '@/types/authTypes'
import axios from 'axios'

const API_URL = 'https://dev.vardek.online'
const REQUEST_TIMEOUT = 10000

//можно это сделать хуком
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

  // async login(credentials: LoginData){
  //   const { data } = await client.POST('/api/modeller/auth/login/', {
  //     body: {
  //       login: credentials.login,
  //       password: credentials.password
  //     }
  //   })

  //   //TODO
  //   return data as ApiResponse
  // },

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