import { ApiResponse, LoginData } from '@/types/authTypes'
import axios, { type AxiosError } from 'axios'

// const API_URL = 'https://dev.vardek.online'
const API_URL = 'https://vardek.ru'
const REQUEST_TIMEOUT = 10000

export const CatalogService = {
  async getCatalogList(id:any = false, page:any = '1'): Promise<any> {
    try {
      const { data } = await axios.get(
        `${API_URL}/local/templates/constructor/API/data.get.php?config=43830&style=689680&cityid=17281&cityidprice=17281&section=${id}&type=catalog&page=${page}`,
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

  async getSearchProducts(value: any, section:any = false, page:any = '1'): Promise<any> {
    try {
      const { data } = await axios.get(
        `${API_URL}/local/templates/constructor/API/data.get.php?config=43830&style=689680&cityid=17281&cityidprice=17281&section=${section}&type=catalog&page=${page}&filter=${value}`,
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

  async getProductDetails(id: number | string, customPriceType: boolean = false) {
    const url = `${API_URL}/local/templates/constructor/API/catalog.element.get.php`;
    
    // Создаем объект FormData
    const formData = new FormData();
    formData.append('ID', id.toString());
    formData.append('custom_price_type', customPriceType.toString());

    const response = await axios.post(url, formData, {
      headers: {
        // Axios автоматически установит правильный Content-Type для FormData
        // включая boundary для multipart/form-data
      }
    });

    return response.data;
  },

  async getPrice() {
    const url = `${API_URL}/local/templates/constructor/API/catalog.element.getprice.php`;
    
    // Получаем форму из DOM
    const formElement = document.querySelector('.product__form.catalog-element-form') as HTMLFormElement;
    
    if (!formElement) {
        throw new Error('Форма не найдена');
    }

    // Создаем FormData из формы
    const formData = new FormData(formElement);
    

    const response = await axios.post(url, formData, {
      headers: {
        // Axios автоматически установит правильный Content-Type для FormData
        // включая boundary для multipart/form-data
      }
    });

    return response.data;
  },
}