import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { useBasketApi } from '@/store/appStore/basket/useBasketApi'
import { useBasketStorage } from '@/store/appStore/basket/useBasketStorage'
import { useRoomContantData } from '../appliction/useRoomContantData'
import { createBasketItem } from '@/components/Basket/helper/basketMapper'
import type { IBasket, IBasketResponse, BasketItemType } from '@/types/basket'

// Вспомогательные функции
const generateUniqueId = (): string => 
  `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useBasketStore = defineStore('basket', () => {
  // Композиции
  const { mainConstructor, mainCatalog, initializeFromStorage, clearStorage } = useBasketStorage()
  const { loading, error, syncBasketWithServer, syncInvoice } = useBasketApi()

  // State
  const basketData = ref<IBasketResponse | null>(null)

  // Инициализация
  // initializeFromStorage()

  // Getters
  const totalItems = computed(() => mainConstructor.value.length + mainCatalog.value.length)
  const totalPrice = computed(() => basketData.value?.basket?.sum ?? 0)
  const totalOldPrice = computed(() => basketData.value?.basket?.sumOld ?? 0)
  const allBasketItems = computed(() => [...mainConstructor.value, ...mainCatalog.value])

  // Actions
  const addFromCatalog = (productData: any) => {
    const basketItem: IBasket = {
      BASKETID: generateUniqueId(),
      PRODUCT: productData.ID,
      PROPS: productData,
      QUANTITY: productData.QUANTITY,
      TYPE: 'catalog',
    }

    mainCatalog.value.push(basketItem)
    syncBasket();
  }

  const addFromScene = () => {
    const roomContantData = useRoomContantData().getRoomContantDataForBasket
    const roomDataCopy = JSON.parse(roomContantData)

    const sceneItems = Object.entries(roomDataCopy)
      .filter(([_, obj]: [string, any]) => obj.data.PRODUCT)
      .map(([key, obj]: [string, any]) => 
        createBasketItem(obj.data, mainConstructor.value.length, obj.basketId)
      )
    mainConstructor.value = sceneItems
  }

  const removeItem = (type: string, basketId: string) => {
    const list = type === 'scene' ? mainConstructor : mainCatalog
    const index = list.value.findIndex(item => String(item.BASKETID) === String(basketId))
    
    if (index !== -1) {
      list.value.splice(index, 1)
      syncBasket();
    }
  }

  const removeFromBasket = (basketId: string, type: string) => {
    removeItem(type, basketId)
  }

  const updateQuantity = (basketId: string, type: string, quantity: number) => {
    const list = type === 'catalog' ? mainCatalog.value : mainConstructor.value
    const item = list.find(i => String(i.BASKETID) === String(basketId))
    
    if (item) {
      item.QUANTITY = quantity
      syncBasket();
    }
  }

  const clearBasket = () => {
    clearStorage()
    basketData.value = null
  }

  const syncBasket = async (): Promise<IBasketResponse | null> => {
    const result = await syncBasketWithServer(allBasketItems.value)
    if (result) {
      basketData.value = result
    }
    return result
  }

  const syncInvoce = async (): Promise<IBasketResponse | null> => {
    const result = await syncInvoice(allBasketItems.value)
    return result
  }

  return {
    // State
    basketData: readonly(basketData),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    mainConstructor: readonly(mainConstructor),
    mainCatalog: readonly(mainCatalog),
    totalItems,
    totalPrice,
    totalOldPrice,
    allBasketItems: readonly(allBasketItems),

    // Actions
    addFromCatalog,
    addFromScene,
    removeItem,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    syncBasket,
    syncInvoce,
  }
})