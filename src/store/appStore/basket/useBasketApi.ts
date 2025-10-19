import { readonly, ref } from 'vue'
import { BasketService } from '@/services/basketService'
import type { IBasket, IBasketResponse, BasketRequest } from '@/types/basket'

export function useBasketApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const syncBasketWithServer = async (basketItems: IBasket[]): Promise<IBasketResponse | null> => {
    loading.value = true
    error.value = null

    try {
      // if (basketItems.length === 0) {
      //   return null
      // }

      const request: BasketRequest = {
        BASKET: basketItems,
        TYPE_PRICE: 25,
      }

      const response = await BasketService.getBasket(request)
      return { ...response.DATA }
    } catch (err: any) {
      error.value = err.message || 'Ошибка при синхронизации корзины'
      console.error('Sync basket error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const syncInvoice = async (basketItems: IBasket[]): Promise<IBasketResponse | null> => {
    loading.value = true
    error.value = null

    try {
      if (basketItems.length === 0) {
        return null
      }

      const request: BasketRequest = {
        BASKET: basketItems,
        TYPE_PRICE: 25,
      }

      const response = await BasketService.invoceBasket(request)
      return response?.DATA?.type !== 'error' ? response.DATA : null
    } catch (err: any) {
      error.value = err.message || 'Ошибка при синхронизации корзины'
      console.error('Sync invoice error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    syncBasketWithServer,
    syncInvoice,
  }
}