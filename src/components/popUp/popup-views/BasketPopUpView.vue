<script lang="ts" setup>
// @ts-nocheck 31

import { nextTick, onMounted, ref, watch } from 'vue';
import axios from 'axios';

import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { useEventBus } from "@/store/appliction/useEventBus";
import { _URL } from "@/types/constants";

import CopyBasketButton from "@/components/ui/buttons/basket/CopyBasketButton.vue";
import DeleteBasketButton from "@/components/ui/buttons/basket/DeleteBasketButton.vue";

const eventBus = useEventBus();
const popupStore = usePopupStore();
const roomContantData = useRoomContantData().getRoomContantData
const _roomContantData = useRoomContantData()

const contentLenght = ref<number>(0)
const produtcCount = ref<number>(1)
contentLenght.value = Object.keys(roomContantData).length

const errorMessage = ref('');
const basketCostData = ref(null);

interface IBasketFacadeHeandles {
  ID: number | string | null,
  POSITION: string | null
};
interface IBasketFacade {
  COLOR: number | string | null,
  MILLING: number | null,
  PALETTE: number | null,
  SHOWCASE: number | null,
  ALUM: number | null,
  GLASS: number | null,
  PATINA: number | null,
  TYPE: number | null,
  SIZE: {
    WIDTH: number | null,
    HEIGHT: number | null,
    DEPTH: number | null
  } | null,
  HEANDLES: IBasketFacadeHeandles[]
};
interface IBasket {
  PRODUCT: number,
  PROPS: {
    FASADE: IBasketFacade[],
    BODY: {
      COLOR: number | string | null,
      SIZE: {
        WIDTH: number | null,
        HEIGHT: number | null,
        DEPTH: number | null
      }
    },
    OPTIONS: Number[],
    UNIFORM_TEXTURE: {
      GROUP: number | null,
      LEVEL: number | null,
      INDEX: number | null,
      column_INDEX: number | null
    }
  },
  QUANTITY: number;
};

// Будущие запросы на сервер ================================================

async function getBasketPrice() {
  // Параметры, которые передаются на сервер
  const params = {};

  try {
    // Выполнение POST-запроса
    // const response = await axios.post('path' + '/API/data.basket.getprice.php', params)

    // Сохраняем ответ от сервера
    // basketCostData.value = response.data;


    console.log("Корзина открыта — можно загрузить данные");

    const roomContantData = JSON.parse(JSON.stringify(useRoomContantData().getRoomContantData));
    console.log('>>> useRoomContantData().getRoomContantData:', roomContantData);

    const dataForGetPrices: IBasket[] = [];

    for (const key in roomContantData) {
      if (Object.prototype.hasOwnProperty.call(roomContantData, key)) {

        const obj = roomContantData[key];
        const objProps: any = obj.object.userData.PROPS;  //[25].object.userData.PROPS

        const facadeForReq: IBasketFacade[] = [];

        objProps.CONFIG.FASADE_PROPS.forEach((fp: any, index: number) => {
          facadeForReq.push({
            COLOR: fp.COLOR ?? null,
            MILLING: fp.MILLING ?? null,
            PALETTE:  fp.PALETTE ?? null,
            SHOWCASE:  fp.SHOWCASE ?? null,
            ALUM:  fp.ALUM ?? null,
            GLASS:  fp.GLASS ?? null,
            PATINA:  fp.PATINA ?? null,
            TYPE:  fp.TYPE ?? null,
            SIZE: {
              WIDTH: objProps.FASADE[index].object.userData.trueSize.WIDTH ?? null,
              HEIGHT: objProps.FASADE[index].object.userData.trueSize.HEIGHT ?? null,
              DEPTH: objProps.FASADE[index].object.userData.trueSize.DEPTH ?? null
            },
            HEANDLES: []
          });
        });

        const objForRequest: IBasket = {
          PRODUCT: objProps.CONFIG.ID,
          PROPS: {
            FASADE: facadeForReq,
            BODY: {
              COLOR: objProps.CONFIG.MODULE_COLOR ?? null, // [25].object.userData.PROPS.CONFIG.MODULE_COLOR
              SIZE: {
                // objProps.BODY.object.userData.trueSize
                WIDTH: objProps.BODY.object.userData.trueSize.BODY_WIDTH.toFixed(0),
                HEIGHT: objProps.BODY.object.userData.trueSize.BODY_HEIGHT.toFixed(0),
                DEPTH: objProps.BODY.object.userData.trueSize.BODY_DEPTH.toFixed(0)
              }
            },
            OPTIONS: [
              // 7391
            ],
            UNIFORM_TEXTURE: {
              GROUP: objProps.CONFIG.UNIFORM_TEXTURE.group ?? null,
              LEVEL: objProps.CONFIG.UNIFORM_TEXTURE.level ?? null,
              INDEX: objProps.CONFIG.UNIFORM_TEXTURE.index ?? null,
              column_INDEX: objProps.CONFIG.UNIFORM_TEXTURE.column_index ?? null
            }
          },
          QUANTITY: 1 // Количество товара в корзине, по умолчанию 1
        };

        dataForGetPrices.push(objForRequest);

      }
    } // end | roomContantData forIn

    const dataBasket = {
      BASKET: dataForGetPrices,
      TYPE_PRICE: 25
    };

    console.log('dataBasket', dataBasket);

    console.log('>>> dataForGetPrices:', dataBasket);

    const response = await axios.post('https://dev.vardek.online/api/modeller/basket/GetBasket/', dataBasket);

    console.log('<<< response:', response);
    basketCostData.value = response.data.DATA;
    
  } catch (error) {
    // Обработка ошибок
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data || 'Request failed';
    } else {
      errorMessage.value = 'An unexpected error occurred';
    }
  }
}

async function setBasketOrder() {
  // Параметры, которые передаются на сервер
  const params = {};

  try {
    // Выполнение POST-запроса
    const response = await axios.post('path' + '/API/data.basket.getprice.php', params)

    // Сохраняем ответ от сервера
    basketCostData.value = response.data;
  } catch (error) {
    // Обработка ошибок
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data || 'Request failed';
    } else {
      errorMessage.value = 'An unexpected error occurred';
    }
  }
}



// Следим за изменением состояния попапа корзины
watch(
  () => popupStore.popups.basket,
  async (isBasketOpen) => {
    if (isBasketOpen) {

      await getBasketPrice();

    } else {
      console.log("Корзина закрыта");
    }
  },
  { immediate: true } // Если нужно сработать при первом рендере
);

// ==========================================================================

const deleteProductInBusket = (basketProduct: any) => {
  eventBus.emit("A:RemoveModelFromBasket", basketProduct);
  nextTick(() => {
    _roomContantData.setRoomContantData({ ...roomContantData })
  })
}

const toggleInfoPopup = () => {
  popupStore.toggleInfoPopup();
};

const closePopup = () => {
  // console.log(roomContantData);
  popupStore.closePopup('basket');
};
</script>

<template>
  <div>
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
            <div v-for="(product, key) in _roomContantData.getRoomContantData"
              :key="product.userData.PROPS.PRODUCT.NAME + key" class="basket-item">
              <div class="basket-item-image">
                <img src="@/assets/svg/left-menu/question.svg" class="popup-items__question" @click="toggleInfoPopup">

                <img class="" :src="_URL + product.userData.PROPS.PRODUCT.PREVIEW_PICTURE" />
              </div>

              <div class="basket-item-text" style="width: 500px">
                <span class="text__title">{{ product.userData.PROPS.PRODUCT.NAME }} - {{ key }}</span>
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
                -
                <input v-model="produtcCount" type="text" class="amount__input" />
                +
              </div>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-edit">
                <CopyBasketButton />
                <DeleteBasketButton @click="deleteProductInBusket(product)" />
              </p>
            </div>
          </div>
          <p class="basket-none__text" v-else>Товаров в корзине пока нет</p>
        </div>
      </div>
      <div class="basket-footer">
        <div class="basket-footer-info">
          <p class="basket__sum">Общая стоимость: <span>12 348 руб.</span></p>
          <p class="basket__sum-no">Общая стоимость без скидки: <span>12 348 руб.</span></p>
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
  </div>
</template>

<style lang="scss" scoped>
.basket {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: white;
  border-radius: 15px;

  &__title {
    text-align: center;
    color: $black;
    font-size: 32px;
    font-weight: 600;
    word-wrap: break-word;
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

    .basket-inlist {
      height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      overflow-y: auto;

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

        .names__title {
          width: 130px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
        }

        .names__title-big {
          width: 500px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
        }
      }

      &-table {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        display: flex;

        .basket-item {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          padding: 15px 10px;
          border-top: 1px $stroke solid;
          gap: 20px;

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
          }

          &-text {
            display: flex;
            flex-direction: column;

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
          }

          &-cost__text {
            width: 130px;
            font-weight: 500;
            font-size: 15px;
          }

          &-edit {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
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

    &-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    &-buttons {
      display: flex;
      align-items: center;
      gap: 10px;

      .basket__error {
        display: flex;
        align-items: center;
        margin-right: 30px;
        color: $red;
      }

      button {
        width: 114px;
        height: 50px;
        background: $stroke;
        border-radius: 15px;
        border: none;
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
      }

      .basket__order {
        width: 174px;
        color: $white;
        font-weight: 600;
        background-color: $red;
      }
    }
  }
}
</style>
