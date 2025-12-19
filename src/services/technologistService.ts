//@ts-nocheck
import { COOKIE_NAMES, getCookie, setCookie } from '@/components/authorization/utils/cookieUtils';
import axios, { AxiosError } from 'axios';
import {TechnologistFormItem, TechnologistResponse} from "@/types/technologist.ts";

const BASE_API_URL = 'https://dev.vardek.online/api/modellerjwt/formtech';
// const BASE_API_URL = 'https://dev.vardek.online/api/modeller/formtech';
const REQUEST_TIMEOUT = 10000; // 10 секунд

export const TechnologistService = {
  /**
   * Отправляет заявку на проверку проекта технологом
   * @param techForm - объект данных заявки
   * @returns Promise<TechnologistResponse>
   */
  async submitTechForm(techForm: FormData): Promise<TechnologistResponse> {
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
    
    try {
      const { data } = await axios.post<TechnologistResponse>(
          `${BASE_API_URL}/SendForm/`,
          techForm,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            timeout: REQUEST_TIMEOUT,
          }
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<TechnologistResponse>;
        const message =
          axiosError.response?.data?.message ||
          'Ошибка при отправке заявки';
        throw new Error(message);
      }
      throw new Error('Неизвестная ошибка при запросе к серверу');
    }
  },
};