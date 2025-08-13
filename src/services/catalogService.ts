import axios from 'axios'

// Константы
const API_URL = 'https://vardek.ru'
const BASE_API_URL = `${API_URL}/local/templates/constructor/API`
const REQUEST_TIMEOUT = 10000


// Сервис
export const CatalogService = {
  async getCatalogList({
    idSection = false,
    page = '1',
    query = false
  }: CatalogListParams = {}): Promise<CatalogResponse> {
    try {
      let filter = ''
      if (query) filter = `&filter=${query}`
      
      const { data } = await axios.get(
        `${BASE_API_URL}/data.get.php?config=43830&style=689680&cityid=17281&cityidprice=17281&section=${idSection}&type=catalog&page=${page}${filter}`,
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

  async getProductDetails( data: ProductRequestData): Promise<ProductDetailsResponse> {
    try {
      const url = `${BASE_API_URL}/catalog.element.get.php`
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: REQUEST_TIMEOUT
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка при получении деталей продукта')
      }
      throw error
    }
  },

  async getProductPrice(formData: ProductRequestData): Promise<ProductPriceResponse> {
    try {
      const url = `${BASE_API_URL}/catalog.element.getprice.php`
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: REQUEST_TIMEOUT
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Ошибка при получении цены продукта')
      }
      throw error
    }
  },
  
}