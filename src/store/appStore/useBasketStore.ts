import { ref } from 'vue';
import axios from 'axios';
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { _URL } from "@/types/constants";
import { 
  IBasketFacade,
  IBasket,  
} from "@/types/basket";
import { useEventBus } from "@/store/appliction/useEventBus";
import { defineStore } from 'pinia';

export const useBasketStore = defineStore('catalog', () => {
  const roomContantData = useRoomContantData().getRoomContantData;
  const contentLenght = ref<number>(Object.keys(roomContantData).length);
  const errorMessage = ref<string>('');
  const basketCostData = ref<any>(null);
  const dataBasketData = ref<any>(null);
  const eventBus = useEventBus();

  // Функция для сравнения двух объектов корзины
  const areBasketsEqual = (basket1: IBasket[], basket2: IBasket[]): boolean => {
    if (basket1.length !== basket2.length) return false;
    
    return basket1.every((item1, index) => {
      const item2 = basket2[index];
      return JSON.stringify(item1) === JSON.stringify(item2);
    });
  };

  // Получение цен корзины
  const getBasketPrice = async () => {
    try {
      const roomContantData = JSON.parse(JSON.stringify(useRoomContantData().getRoomContantData));
      const dataForGetPrices: IBasket[] = [];

      for (const key in roomContantData) {
        if (Object.prototype.hasOwnProperty.call(roomContantData, key)) {
          const obj = roomContantData[key];
          const objProps: any = obj.object.userData.PROPS;

          const facadeForReq: IBasketFacade[] = objProps.CONFIG.FASADE_PROPS.map((fp: any, index: number) => ({
            COLOR: fp.COLOR ?? null,
            MILLING: fp.MILLING ?? null,
            PALETTE: fp.PALETTE ?? null,
            SHOWCASE: fp.SHOWCASE ?? null,
            ALUM: fp.ALUM ?? null,
            GLASS: fp.GLASS ?? null,
            PATINA: fp.PATINA ?? null,
            TYPE: fp.TYPE ?? null,
            SIZE: {
              WIDTH: objProps.FASADE[index].object.userData.trueSize.WIDTH ?? null,
              HEIGHT: objProps.FASADE[index].object.userData.trueSize.HEIGHT ?? null,
              DEPTH: objProps.FASADE[index].object.userData.trueSize.DEPTH ?? null
            },
            HEANDLES: []
          }));

          const objForRequest: IBasket = {
            PRODUCT: objProps.CONFIG.ID,
            PROPS: {
              FASADE: facadeForReq,
              BODY: {
                COLOR: objProps.CONFIG.MODULE_COLOR ?? null,
                SIZE: {
                  WIDTH: objProps.BODY.object.userData.trueSize.BODY_WIDTH.toFixed(0),
                  HEIGHT: objProps.BODY.object.userData.trueSize.BODY_HEIGHT.toFixed(0),
                  DEPTH: objProps.BODY.object.userData.trueSize.BODY_DEPTH.toFixed(0)
                }
              },
              OPTIONS: [],
              UNIFORM_TEXTURE: {
                GROUP: objProps.CONFIG.UNIFORM_TEXTURE.group ?? null,
                LEVEL: objProps.CONFIG.UNIFORM_TEXTURE.level ?? null,
                INDEX: objProps.CONFIG.UNIFORM_TEXTURE.index ?? null,
                column_INDEX: objProps.CONFIG.UNIFORM_TEXTURE.column_index ?? null
              }
            },
            QUANTITY: 1
          };

          dataForGetPrices.push(objForRequest);
        }
      }

      const newBasket = {
        BASKET: dataForGetPrices,
        TYPE_PRICE: 25
      };

      if (dataBasketData.value) {
        if (!areBasketsEqual(dataForGetPrices, dataBasketData.value.BASKET)) {
          console.log('Basket data has changed, updating...');
          const response = await axios.post(
            'https://dev.vardek.online/api/modeller/basket/GetBasket/', 
            newBasket
          );
          basketCostData.value = response.data.DATA;
          dataBasketData.value = newBasket;
        } else {
          console.log('Basket data unchanged, using cached data');
          const response = await axios.post(
            'https://dev.vardek.online/api/modeller/basket/GetBasket/', 
            dataBasketData.value
          );
          basketCostData.value = response.data.DATA;
        }
      } else {
        console.log('No existing basket data, creating new');
        const response = await axios.post(
          'https://dev.vardek.online/api/modeller/basket/GetBasket/', 
          newBasket
        );
        basketCostData.value = response.data.DATA;
        dataBasketData.value = newBasket;
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorMessage.value = error.response?.data || 'Request failed';
      } else {
        errorMessage.value = 'An unexpected error occurred';
      }
    }
  };

  const getQuantityBasket = async (id: string | number, quantity: number) => {
    try {
      const updatedBasket = dataBasketData.value.BASKET.map((item: any) => {
        if (+item.PRODUCT === +id) {
          return {
            ...item,
            QUANTITY: Math.max(1, quantity)
          };
        }
        return item;
      });

      const dataBasket = {
        BASKET: updatedBasket,
        TYPE_PRICE: 25
      };

      const response = await axios.post(
        'https://dev.vardek.online/api/modeller/basket/GetBasket/', 
        dataBasket
      );
      
      basketCostData.value = response.data.DATA;
      dataBasketData.value = dataBasket;

      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении количества товара:', error);
      throw error;
    }
  };

  const deletItemBasket = async (id: string | number) => {
    try {
      const updatedBasket = dataBasketData.value.BASKET.filter((item: any) => +item.PRODUCT !== +id);

      if (updatedBasket.length === dataBasketData.value.BASKET.length) {
        console.warn('Товар с ID', id, 'не найден в корзине');
        return;
      }

      const dataBasket = {
        BASKET: updatedBasket,
        TYPE_PRICE: 25
      };

      const response = await axios.post(
        'https://dev.vardek.online/api/modeller/basket/GetBasket/', 
        dataBasket
      );
      
      basketCostData.value = response.data.DATA;
      dataBasketData.value = dataBasket;
      eventBus.emit("A:RemoveModelFromBasket", id);

      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении товара из корзины:', error);
      throw error;
    }
  };

  const setBasketOrder = async () => {
    try {
      const response = await axios.post('path' + '/API/data.basket.getprice.php', {});
      basketCostData.value = response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorMessage.value = error.response?.data || 'Request failed';
      } else {
        errorMessage.value = 'An unexpected error occurred';
      }
    }
  };

  return {
    contentLenght,
    errorMessage,
    basketCostData,
    dataBasketData,
    deletItemBasket,
    getBasketPrice,
    getQuantityBasket,
    setBasketOrder
  };
});