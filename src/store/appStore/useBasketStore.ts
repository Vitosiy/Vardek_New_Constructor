import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRoomContantData } from "../appliction/useRoomContantData";
import { BasketService } from "@/services/basketService";
import { createBasketItem } from "@/components/Basket/helper/basketHelpers";
import { useEventBus } from "../appliction/useEventBus";
import { usePopupStore } from "./popUpsStore";

export const useBasketStore = defineStore("basket", () => {
  // Реактивные ссылки для данных
  const mainConstructor = ref<any[]>([]);
  const mainCatalog = ref<any[]>([]);
  const basketData = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const popupStore = usePopupStore();
  // Восстановление из localStorage
  const saved = localStorage.getItem("basket-data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      mainConstructor.value = parsed.mainConstructor || [];
      mainCatalog.value = parsed.mainCatalog || [];
    } catch (e) {
      console.error("Error parsing saved basket data", e);
    }
  }

  // Вычисляемые свойства
  const totalItems = computed(() => 
    mainConstructor.value.length + mainCatalog.value.length
  );

  const totalPrice = computed(() => basketData.value?.basket?.sum ?? 0);
  const totalOldPrice = computed(() => basketData.value?.basket?.sumOld ?? 0);

  // Функции
  function addFromCatalog(data: any) {
    const generateUniqueId = () =>
      `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const obj = {
      BASKETID: generateUniqueId(),
      PRODUCT: data.ID,
      PROPS: data,
      QUANTITY: data.QUANTITY,
      TYPE: "catalog",
    };

    mainCatalog.value.push(obj);
    syncBasket();
  }

  async function addFromScene() {   
    console.log('start') 
    const roomContantData = useRoomContantData().getRoomContantData;
    const roomDataCopy = JSON.parse(JSON.stringify(roomContantData));
    console.log(roomDataCopy)
    console.log(roomContantData)

    const dataForGetPrices = Object.entries(roomDataCopy)
      .map(([key, obj]: [string, any]) => createBasketItem(
        obj?.object?.userData?.PROPS, 
        mainConstructor.value.length,
        key
      ));
    mainConstructor.value = dataForGetPrices;
    syncBasket();
    console.log('end')
  }

  function removeItem(type: "mainConstructor" | "mainCatalog", basketId: string) {
    if (type === "mainConstructor") {
      const index = mainConstructor.value.findIndex(item => item.BASKETID === basketId);
      if (index !== -1) {
        mainConstructor.value.splice(index, 1);
      }
    } else {
      const index = mainCatalog.value.findIndex(item => item.BASKETID === basketId);
      if (index !== -1) {
        mainCatalog.value.splice(index, 1);
      }
    }
    syncBasket();
  }

  function clearBasket() {
    mainConstructor.value = [];
    mainCatalog.value = [];
    basketData.value = null;
    localStorage.removeItem("basket-data");
  }

  async function syncBasket() {
    loading.value = true;
    error.value = null;

    try {
      // Сохраняем в localStorage
      // localStorage.setItem("basket-data", JSON.stringify({
      //   mainConstructor: mainConstructor.value,
      //   mainCatalog: mainCatalog.value
      // }));

      const merged = [...mainConstructor.value, ...mainCatalog.value];
      
      if (merged.length === 0) {
        basketData.value = null;
        return;
      }

      const newBasket = {
        BASKET: merged,
        TYPE_PRICE: 25,
      };

      const response = await BasketService.getBasket(newBasket);
      if (response?.DATA?.type !== "error") {
        // ОБЯЗАТЕЛЬНО: присваиваем новое значение для реактивности
        basketData.value = { ...response.DATA };
        return basketData.value;
      } else {
        clearBasket();
      }
    } catch (err: any) {
      error.value = err.message || "Ошибка при синхронизации корзины";
      console.error("Sync basket error:", err);
    } finally {
      loading.value = false;
    }
  }

  const removeFromBasket = (idBasket: string, type: string) => {
    if (type === 'catalog') {
      const index = mainCatalog.value.findIndex(item => item.BASKETID === idBasket);
      if (index !== -1) {
        mainCatalog.value.splice(index, 1);
      }
    } else if (type === 'scene') {
      const index = mainConstructor.value.findIndex(item => item.BASKETID === idBasket);
      if (index !== -1) {
        mainConstructor.value.splice(index, 1);
      }


      const roomContantData = useRoomContantData().getRoomContantData;
      const { setRoomContantData } = useRoomContantData();

      const map: any = roomContantData as any;
      const item: any = map?.[idBasket];
      const object3D = item?.object;

      useEventBus().emit('A:RemoveModelFromBasket', { product: object3D, basketId: idBasket });

      if (item) {
        const newMap: any = { ...(map || {}) };
        delete newMap[idBasket];
        setRoomContantData(newMap);
      }
      const modelController = document.querySelector('.model-controller');
      if (modelController) {
        modelController.classList.remove('model-controller--active');
      }
    }
    
    syncBasket();
  };

  const updateQuantityFromBaske = (idBasket: string, type: string, quantity: any) => {
    if (type === 'catalog') {
      mainCatalog.value.find(item => item.BASKETID === idBasket).QUANTITY = quantity;
    }
    syncBasket();
  }

  return {
    // State
    basketData,
    loading,
    error,
    
    // Getters
    mainConstructor: computed(() => mainConstructor.value),
    mainCatalog: computed(() => mainCatalog.value),
    totalItems,
    totalPrice,
    totalOldPrice,

    // Actions
    addFromCatalog,
    addFromScene,
    removeItem,
    clearBasket,
    syncBasket,
    removeFromBasket,
    updateQuantityFromBaske
  };
});