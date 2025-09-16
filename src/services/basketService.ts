import axios, { AxiosError } from 'axios';

// Предполагаемые типы (настройте под ваш бэкенд)
interface BasketItem {
  id: string;
  quantity: number;
  // другие поля...
}

interface BasketResponse {
  success: boolean;
  data: BasketItem[];
  message?: string;
}

interface NewBasketRequest {
  items: BasketItem[];
  // другие поля, если нужны (например, userId, sessionId и т.д.)
}

const BASE_API_URL = 'https://dev.vardek.online/api/modellerjwt/basket';
// const BASE_API_URL = 'https://dev.vardek.online/api/modeller/basket';
const REQUEST_TIMEOUT = 10000; // 10 секунд

export const BasketService = {
  /**
   * Отправляет данные корзины и получает обновлённую корзину
   * @param newBasket - объект с данными новой корзины
   * @returns Promise<BasketResponse>
   */
  async getBasket(newBasket: NewBasketRequest): Promise<BasketResponse> {
    try {
      const { data } = await axios.post<BasketResponse>(
        `${BASE_API_URL}/GetBasket/`,
        newBasket,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: REQUEST_TIMEOUT,
        }
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BasketResponse>;
        const message =
          axiosError.response?.data?.message ||
          'Ошибка при получении корзины';
        throw new Error(message);
      }
      throw new Error('Неизвестная ошибка при запросе к серверу');
    }
  },

  /**
   * Пример другого метода — очистка корзины
   */
  async clearBasket(): Promise<BasketResponse> {
    try {
      const { data } = await axios.post<BasketResponse>(
        `${BASE_API_URL}/GetBasket/`,
        [],
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: REQUEST_TIMEOUT,
        }
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BasketResponse>;
        const message =
          axiosError.response?.data?.message || 'Ошибка при очистке корзины';
        throw new Error(message);
      }
      throw new Error('Неизвестная ошибка');
    }
  },
};