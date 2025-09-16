<template>
  <div class="basket">
    <div class="basket__title">Корзина</div>
    <div class="basket__container">
      <div class="basket-inlist">
        <div class="basket-inlist-names">
          <div class="names__title">Фото</div>
          <div class="names__title-big">Наименование</div>
          <div class="names__title">Количество</div>
          <div class="names__title">Цена</div>
          <div class="names__title">Сумма</div>
          <div class="names__title">Сумма без скидки</div>
          <div class="names__title"></div>
        </div>
        <div v-if="contentLenght != 0" class="basket-inlist-table">
          <!-- <div 
            v-for="(product, key) in _roomContantData.getRoomContantData"
            :key="product.userData.PROPS.PRODUCT.NAME + key" 
            class="basket-item"
          > -->
          <div 
            v-for="(item, key) in products"
            :key="item.product.ID" 
            class="basket-item"
          > 
              <div class="basket-item-image">
                <img src="@/assets/svg/left-menu/question.svg" class="popup-items__question" @click="toggleInfoPopup">

                <img class="basket-item-image-main" :src="`${API_URL + '/' + item.product.PREVIEW_PICTURE}`" />
              </div>

              <div class="basket-item-text" style="width: 500px">
                <span class="text__title">{{ item.product.NAME }} - {{ item.product.ID }}</span>
                <div class="text-item-list">
                  <p>Услуга:</p>
                  <ul>
                    <li>{{}}</li>
                  </ul>
                </div>
                <div class="text-item-red">
                  <p>Цвет фасада 1: <span>Матовый (НЕДОСТУПНО)</span></p>
                </div>
              </div>
              <div class="basket-item-amount">
                <button class="amount__btn" type="button" @click="downCount(item.product)">-</button>
                <input v-model="item.product.quantity" @change="handleQuantityChange(item.product)" type="text" class="amount__input" />
                <button class="amount__btn" type="button" @click="addCount(item.product)">+</button>
              </div>
              <p class="basket-item-cost__text">{{ item.product.unitPriceFormat }}</p>
              <p class="basket-item-cost__text">{{ item.product.allPriceFormat }}</p>
              <p class="basket-item-cost__text">{{  Math.round(item.product.allPrice * 1.25).toLocaleString('ru-RU') }} руб</p>
              <p class="basket-item-edit">
                <CopyBasketButton />
                <DeleteBasketButton @click="deleteProductInBusket(item.product)" />
              </p>
          </div>

        </div>
        <p v-else class="basket-none__text">Товаров в корзине пока нет</p>


        
      </div>
    </div>
      <div class="basket-footer">
        <div class="basket-footer-info">
          <p class="basket__sum">Общая стоимость: <span>{{ basket?.sumFormat }}</span></p>
          <p class="basket__sum-no">Общая стоимость без скидки: <span>{{  Math.round(basket?.sum * 1.25).toLocaleString('ru-RU')  }} руб.</span></p>
        </div>
        <div class="basket-footer-buttons">
          <div class="basket__error">
            <p class="error__title"></p>
            <!-- <p class="error__title">1 Ошибка</p> -->
          </div>
          <button class="basket__close" @click="closePopup">Закрыть</button>
          <button class="basket__save">Печать</button>
          <button class="basket__order" @click="setBasketOrder">Оформить заказ</button>
        </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // @ts-nocheck 31
  import { nextTick, ref, watch } from 'vue';
  import { usePopupStore } from '@/store/appStore/popUpsStore';
  import { useRoomContantData } from "@/store/appliction/useRoomContantData";
  import { useEventBus } from "@/store/appliction/useEventBus";
  import CopyBasketButton from "@/components/ui/buttons/basket/CopyBasketButton.vue";
  import DeleteBasketButton from "@/components/ui/buttons/basket/DeleteBasketButton.vue";
  import { useBasketStore } from '@/store/appStore/useBasketStore';
  import { storeToRefs } from 'pinia';

  const eventBus = useEventBus();
  const popupStore = usePopupStore();
  const roomContantData = useRoomContantData().getRoomContantData;
  const _roomContantData = useRoomContantData();
  const basketStore = useBasketStore();

  const {       
    basketCostData,
    dataBasketData,
    errorMessage,
    contentLenght,
  } = storeToRefs(basketStore);

  const { 
    getBasketPrice,
    setBasketOrder, 
    getQuantityBasket, 
    deletItemBasket,
  } = basketStore;


  const API_URL = 'https://dev.vardek.online'
  // Новые переменные для хранения данных
  const basket = ref<any>(null);
  const products = ref<any[]>([]);


  const toggleInfoPopup = () => {
    popupStore.toggleInfoPopup();
  };

  const closePopup = () => {
    popupStore.closePopup('basket');
  };

  const downCount = async (product: any) => {
    if (+product.quantity <= 1 ) return;
    const count = --product.quantity
    await getQuantityBasket(product.ID, count);
  }

  const addCount = async (product: any) => {
    const count = ++product.quantity
    await getQuantityBasket(product.ID, count);
  }

  // Добавьте этот метод в ваш компонент
  const handleQuantityChange = async (product: any) => {
      if (+product.quantity <= 1 ) return;
      const count = ++product.quantity
      await getQuantityBasket(product.ID, count);
  };



      // Удаление продукта из корзины
  const deleteProductInBusket = async (basketProduct: any) => {
    console.log(basketProduct.ID);
    console.log(basketProduct.quantity);
    eventBus.emit('A:RemoveModelFromBasket', {payload: { products: basketProduct }})
    eventBus.emit('A:RemoveModel', {payload: { products: basketProduct }})
    await deletItemBasket(basketProduct.ID);
    // eventBus.emit("A:RemoveModelFromBasket", basketProduct);
    // nextTick(() => {
    //   _roomContantData.setRoomContantData({ ...roomContantData });
    // });
    
  };

  const basketPrice = () => {
    // ваша логика получения цены 

    console.log('Получаем цену корзины...');
    // например, вызов API или вычисление из store
    basketStore.getBasketPrice();
  };

  // Отслеживаем изменения basketCostData
  watch(
    () => basketCostData?.value,
    (newValue) => {
      if (newValue) {
        console.log('Данные корзины обновлены:', newValue);
        // Записываем данные в переменные
        basket.value = newValue.basket; // или другая структура, в зависимости от ответа API
        products.value = newValue.products ; // или другой путь к массиву продуктов
      }
    },
    { deep: true }
  );

  // Следим за открытием/закрытием попапа корзины
  watch(
    () => popupStore.popups.basket,
    (isBasketOpen) => {
      if (isBasketOpen) {
        // basketPrice();
      } else {  
        console.log("Корзина закрыта");
      }
    },
    { immediate: true }
  );


</script>

<style lang="scss" scoped>
.basket {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: white;
  border-radius: 15px;
  padding: 15px;
  width: 100%;
  box-sizing: border-box;

  &__title {
    text-align: center;
    color: $black;
    font-size: 32px;
    font-weight: 600;
    word-wrap: break-word;
    
    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  &__container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 20px 10px;
    background: #f6f5fa;
    border-radius: 15px;
    gap: 30px;
    width: 100%;

    .basket-inlist {
      height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      overflow-y: auto;
      width: 100%;

      .basket-none__text {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &-names {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 10px;
        padding-right: 10px;
        gap: 20px;
        width: 100%;
        flex-wrap: wrap;

        .names__title {
          width: 130px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
          
          @media (max-width: 768px) {
            width: 80px;
            font-size: 13px;
          }
        }

        .names__title-big {
          width: 500px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
          
          @media (max-width: 1024px) {
            width: 300px;
          }
          
          @media (max-width: 768px) {
            width: 150px;
            font-size: 13px;
          }
        }
      }

      &-table {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        display: flex;
        width: 100%;

        .basket-item {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          padding: 15px 10px;
          border-top: 1px $stroke solid;
          gap: 20px;
          width: 100%;
          flex-wrap: wrap;
          
          @media (max-width: 768px) {
            flex-direction: column;
            gap: 15px;
            position: relative;
            padding-bottom: 40px;
          }

          .popup-items__question {
            position: absolute;
            top: 10px;
            right: 5px;
            cursor: pointer;
          }

          &-image {
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
            border-radius: 10px;
            &-main {
              width: 100%;
            }
            @media (max-width: 768px) {
              width: 100%;
              height: auto;
              aspect-ratio: 1/1;
            }
          }

          &-text {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 300px;
            
            @media (max-width: 768px) {
              min-width: unset;
              width: 100%;
            }

            .text__title {
              font-size: 15px;
              font-weight: 600;
            }

            .text__info {
              display: flex;
              align-items: center;
              gap: 10px;

              &__result {}
            }
          }

          &-amount {
            width: 130px;
            display: flex;
            align-items: center;
            gap: 10px;
            
            @media (max-width: 768px) {
              width: 100%;
              justify-content: flex-start;
            }

            .amount__input {
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background: none;
              border-radius: 10px;
              border: 1px solid $stroke;
            }
            .amount__btn {
              background-color: transparent;
              border: none;
            }
          }

          &-cost__text {
            width: 130px;
            font-weight: 500;
            font-size: 15px;
            
            @media (max-width: 768px) {
              width: auto;
              position: absolute;
              right: 15px;
              bottom: 15px;
              font-size: 16px;
              font-weight: 600;
            }
          }

          &-edit {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            
            @media (max-width: 768px) {
              position: absolute;
              right: 15px;
              top: 15px;
            }
          }
        }
      }

      &::-webkit-scrollbar {
        width: 3px;
        border-radius: 15px;
      }

      &::-webkit-scrollbar-track {}

      &::-webkit-scrollbar-thumb {
        background-color: $dark-grey;
        transform: translateX(-5px);
        box-shadow: inset 0 0 1px $dark-grey;
        border-radius: 15px;
      }
    }
  }

  .basket-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    &-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      
      @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
      }

      .basket__error {
        display: flex;
        align-items: center;
        margin-right: 30px;
        color: $red;
        
        @media (max-width: 768px) {
          width: 100%;
          margin-right: 0;
          margin-bottom: 10px;
          justify-content: center;
        }
      }

      button {
        width: 114px;
        height: 50px;
        background: $stroke;
        border-radius: 15px;
        border: none;
        
        @media (max-width: 768px) {
          flex: 1;
          min-width: 100px;
        }
      }

      .basket__close {
        color: $strong-grey;
        font-weight: 600;
      }

      .basket__save {
        width: 132px;
        color: $white;
        font-weight: 600;
        background-color: $black;
        
        @media (max-width: 768px) {
          width: auto;
          flex: 1;
        }
      }

      .basket__order {
        width: 174px;
        color: $white;
        font-weight: 600;
        background-color: $red;
        
        @media (max-width: 768px) {
          width: auto;
          flex: 2;
        }
      }
    }
  }
}
</style>
